"use server";
import { auth } from "@clerk/nextjs/server";
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
}


export async function rateDish(params: {
  dishId: string;
  rating: number;
}): Promise<ActionResponse> {
  const conn = await dbConnect();
  const { userId } = await auth();
  const dishRating = await DishRating.findOne({ dishId: params.dishId, userId: userId });

  if (!dishRating) {
    const DishRatingModel = conn.model("DishRating", Dish.schema);

    const dishRating = await DishRatingModel.create({
      dishId: params.dishId,
      ratings: params.rating,
      userId: userId
    });
    if (!dishRating) {
      return {
        success: false,
        message: "Failed to rate dish",
      };
    }
    return {
      success: true,
      message: "Dish rated successfully",
    };
  }
  dishRating.rating = params.rating
  await dishRating.save();
  return {
    success: true,
    message: "Dish rating updated successfully",
  }
}

export async function getRestaurantOffer(restaurantId: string) {
  await dbConnect();

  // Find the most recent menu for this restaurant
  const menu = await Menu.findOne({ restaurantId }).sort({ date: -1 }).lean();
  if (!menu) return [];

  const menuItems = await MenuItem.find({
    _id: { $in: menu.items },
  }).lean();

  const dishIds = menuItems.map(item => item.dishId);
  const dishes = await Dish.find({ _id: { $in: dishIds } }).lean();
  const dishesMap = new Map(dishes.map(dish => [dish._id.toString(), dish]));

  return menuItems.map(item => ({
    id: item._id.toString(),
    dishId: item.dishId.toString(),
    name: (dishesMap.get(item.dishId.toString()) as any)?.name || "Nepoznato jelo",
    description: (dishesMap.get(item.dishId.toString()) as any)?.description || "",
    imageUrl: (dishesMap.get(item.dishId.toString()) as any)?.imageUrl || "",
    allergens: (dishesMap.get(item.dishId.toString()) as any)?.allergens || [],
    lastServed: item.lastServed ? new Date(item.lastServed).toLocaleTimeString("hr-HR", { hour: "2-digit", minute: "2-digit" }) : "--:--",
    available: item.available
  }));
}