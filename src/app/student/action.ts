"use server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import Menu, { MenuItem } from "@/models/Menu";
import Dish from "@/models/Dish";
import DishRating from "@/models/DishRating";
import dbConnect from "@/utils/dbConnect";

type ActionResponse = {
  success: boolean;
  message: string;
  data?: any;
  errors?: Record<string, string>;
};

export async function addDishToTodaysOffer(params: {
  menuItemId: string;
  updateDate: Date;
}): Promise<void> {
  await dbConnect();
  await MenuItem.findByIdAndUpdate(
    params.menuItemId,
    { $set: { available: true, lastServed: params.updateDate } },
    { new: true },
  );
  revalidatePath("/student/restaurants/[id]", "page");
}

export async function rateDish(params: {
  dishId: string;
  restaurantId: string;
  rating: number;
}): Promise<ActionResponse> {
  await dbConnect();
  const { userId } = await auth();

  if (!userId) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const dishRating = await DishRating.findOneAndUpdate(
      { dishId: params.dishId, restaurantId: params.restaurantId, userId },
      { rating: params.rating },
      { upsert: true, new: true },
    );

    if (!dishRating) {
      return { success: false, message: "Failed to rate dish" };
    }

    return {
      success: true,
      message: "Dish rating saved successfully",
    };
  } catch (error: any) {
    console.error("Error rating dish:", error);
    return { success: false, message: "Failed to save rating" };
  }
}

export async function getRestaurantOffer(restaurantId: string) {
  await dbConnect();

  // Find the most recent menu for this restaurant
  const menu = await Menu.findOne({ restaurantId }).sort({ date: -1 }).lean();
  if (!menu) return [];

  const menuItems = await MenuItem.find({
    _id: { $in: menu.items },
    available: true,
  }).lean();

  const dishIds = menuItems.map((item) => item.dishId.toString());
  const dishes = await Dish.find({ _id: { $in: dishIds } })
    .populate("allergens")
    .lean();
  const dishesMap = new Map(dishes.map((dish) => [dish._id.toString(), dish]));

  const ratingsData = await DishRating.aggregate([
    { $match: { dishId: { $in: dishIds }, restaurantId } },
    {
      $group: {
        _id: "$dishId",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  const ratingsMap = new Map(
    ratingsData.map((r) => [r._id.toString(), { avg: r.avgRating, count: r.count }]),
  );

  // Fetch current user's ratings
  const { userId } = await auth();
  let userRatingsMap = new Map<string, number>();
  if (userId) {
    const userRatings = await DishRating.find({
      dishId: { $in: dishIds },
      restaurantId,
      userId,
    }).lean();
    userRatingsMap = new Map(userRatings.map((r) => [r.dishId.toString(), r.rating]));
  }

  return menuItems.map((item) => {
    const dishIdStr = item.dishId.toString();
    const dishDetails = dishesMap.get(dishIdStr) as any;
    const ratingInfo = ratingsMap.get(dishIdStr) || { avg: 0, count: 0 };

    return {
      id: item._id.toString(),
      dishId: dishIdStr,
      name: dishDetails?.name || "Nepoznato jelo",
      description: dishDetails?.description || "",
      imageUrl: dishDetails?.imageUrl || "",
      allergens: dishDetails?.allergens?.map((a: any) => a.name) || [],
      lastServed: item.lastServed
        ? new Date(item.lastServed).toLocaleTimeString("hr-HR", {
          hour: "2-digit",
          minute: "2-digit",
        })
        : "--:--",
      available: item.available,
      rating: ratingInfo.avg,
      ratingCount: ratingInfo.count,
      userRating: userRatingsMap.get(dishIdStr) || 0,
    };
  });
}

export async function getAllDishes() {
  await dbConnect();
  const dishes = await Dish.find({}).lean();
  return JSON.parse(JSON.stringify(dishes));
}
