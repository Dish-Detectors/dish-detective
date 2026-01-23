"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import dbConnect from "@/utils/dbConnect";
import Restaurant from "@/models/Restaurant";
import Menu, { MenuItem } from "@/models/Menu";
import Dish from "@/models/Dish";

export async function getManagerRestaurant() {
  const { userId, sessionClaims } = await auth();
  if (!userId || sessionClaims?.metadata?.role !== "manager") {
    return { success: false, error: "Unauthorized" };
  }

  await dbConnect();

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const restaurantId = user.publicMetadata?.restaurantId;

    if (!restaurantId) {
      return { success: false, error: "No restaurant assigned" };
    }

    const restaurant = await Restaurant.findById(restaurantId).lean();
    if (!restaurant) {
      return { success: false, error: "Restaurant not found" };
    }

    // Deep clone to remove Mongoose's non-plain objects (like Buffer-based _id)
    // that cause serialization errors in Client Components.
    const sanitizedData = JSON.parse(JSON.stringify(restaurant));

    return {
      success: true,
      data: sanitizedData,
    };
  } catch (error: any) {
    console.error("Error fetching manager restaurant:", error);
    return { success: false, error: error.message };
  }
}

export async function getRestaurantAvailableDishes(restaurantId: string) {
  const { userId, sessionClaims } = await auth();
  if (!userId || sessionClaims?.metadata?.role !== "manager") {
    // Optionally also check if restaurantId matches the manager's assigned restaurant
    // But for now, just checking role is basic protection,
    // assuming the UI passes the correct ID from the authenticated session context ideally.
    // Better: Fetch manager's restaurant ID and ignore the passed param if we want strict security,
    // or just validte it.
    // Let's implement strict validation.
    return [];
  }

  await dbConnect();
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const userRestaurantId = user.publicMetadata?.restaurantId as string;

  if (userRestaurantId !== restaurantId) {
    return [];
  }

  const restaurant = await Restaurant.findById(restaurantId).lean();
  if (!restaurant || !restaurant.availableDishes) return [];

  const dishes = await Dish.find({
    _id: { $in: restaurant.availableDishes },
  }).lean();

  return JSON.parse(JSON.stringify(dishes));
}

export async function getTodayMenu(restaurantId: string) {
  await dbConnect();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const menu = await Menu.findOne({
    restaurantId,
    date: { $gte: today },
  })
    .populate({ path: "items", populate: { path: "dishId" } })
    .lean();

  if (!menu) return [];

  return (menu.items as any[]).map((item: any) => ({
    menuItemId: item._id.toString(),
    dish: {
      _id: item.dishId._id.toString(),
      name: item.dishId.name,
      imageUrl: item.dishId.imageUrl,
    },
    available: item.available,
  }));
}

export async function addDishToMenu(restaurantId: string, dishId: string) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  await dbConnect();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let menu = await Menu.findOne({ restaurantId, date: { $gte: today } });

  const newMenuItem = await MenuItem.create({
    dishId,
    available: false,
    lastServed: new Date(),
  });

  if (!menu) {
    menu = await Menu.create({
      restaurantId,
      date: today,
      lastUpdatedBy: userId,
      items: [(newMenuItem as any)._id],
    });
  } else {
    menu.items.push((newMenuItem as any)._id);
    menu.lastUpdatedBy = userId as any;
    await menu.save();
  }

  return { success: true, menuItemId: (newMenuItem as any)._id.toString() };
}

export async function removeDishFromMenu(menuItemId: string) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  await dbConnect();

  await MenuItem.findByIdAndDelete(menuItemId);
  await Menu.updateMany({}, { $pull: { items: menuItemId } });

  return { success: true };
}
