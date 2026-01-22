"use server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import Restaurant from "@/models/Restaurant";
import Menu, { MenuItem } from "@/models/Menu";
import Dish from "@/models/Dish";
import dbConnect from "@/utils/dbConnect";

export interface WorkerMenuItem {
  id: string;
  name: string;
  description: string;

  imageUrl: string;
  allergens: string[];
}

export async function getWorkerMenzaId(): Promise<string> {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return "";
  }

  const restaurantId = (sessionClaims as any)?.metadata?.restaurantId;

  if (restaurantId) {
    return restaurantId;
  }

  return "";
}

export async function fetchAllDishesForMenza(
  menzaId: string,
): Promise<WorkerMenuItem[]> {
  await dbConnect();
  const restaurant = await Restaurant.findById(menzaId).lean();
  if (!restaurant) return [];

  const dishIds = restaurant.availableDishes || [];
  const dishes = await Dish.find({ _id: { $in: dishIds } })
    .populate("allergens")
    .lean();

  return dishes.map((dish: any) => ({
    id: dish._id.toString(),
    name: dish.name || "Nepoznato jelo",
    description: dish.description || "",
    allergens: dish.allergens?.map((a: any) => a.name) || [],
    imageUrl: dish.imageUrl || "",
  }));
}

export async function fetchTodaysOfferDishIdsForMenza(
  menzaId: string,
): Promise<string[]> {
  await dbConnect();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const menu = await Menu.findOne({
    restaurantId: menzaId,
    date: { $gte: today },
  }).lean();

  if (!menu) return [];

  const menuItems = await MenuItem.find({
    _id: { $in: menu.items },
    available: true,
  }).lean();

  return menuItems.map((item) => item.dishId.toString());
}

import { sendDishNotification } from "@/actions/notification";

export async function addDishToTodaysOffer(params: {
  dishId: string;
  updateDate: Date;
}): Promise<void> {
  const { userId } = await auth();
  if (!userId) return;

  await dbConnect();
  const menzaId = await getWorkerMenzaId();
  if (!menzaId) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let menu = await Menu.findOne({
    restaurantId: menzaId,
    date: { $gte: today },
  });

  let menuItemId: string | null = null;

  if (menu) {
    const existingMenuItem = await MenuItem.findOne({
      _id: { $in: menu.items },
      dishId: params.dishId,
    });

    if (existingMenuItem) {
      existingMenuItem.available = true;
      existingMenuItem.lastServed = params.updateDate;
      await existingMenuItem.save();
      menuItemId = (existingMenuItem._id as any).toString();
    }
  }

  if (!menuItemId) {
    const newMenuItem = await MenuItem.create({
      dishId: params.dishId,
      available: true,
      lastServed: params.updateDate,
    });
    menuItemId = (newMenuItem._id as any).toString();

    if (!menu) {
      menu = await Menu.create({
        restaurantId: menzaId,
        date: today,
        lastUpdatedBy: userId,
        items: [newMenuItem._id],
      });
    } else {
      menu.items.push(newMenuItem._id as any);
      menu.lastUpdatedBy = userId;
      await menu.save();
    }
  }

  // Send notification to subscribed students
  const timeString = params.updateDate.toLocaleTimeString("hr-HR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (menuItemId) {
    await sendDishNotification(menuItemId, timeString);
  }
  revalidatePath("/student/restaurants/[id]", "page");
  revalidatePath("/worker", "page");
}

export async function fetchTodaysOfferForMenza(
  menzaId: string,
): Promise<WorkerMenuItem[]> {
  await dbConnect();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const menu = await Menu.findOne({
    restaurantId: menzaId,
    date: { $gte: today },
  }).lean();

  if (!menu) return [];

  const menuItems = await MenuItem.find({
    _id: { $in: menu.items },
    available: true,
  }).lean();

  const dishIds = menuItems.map((item) => item.dishId);
  const dishes = await Dish.find({
    _id: { $in: dishIds },
  })
    .populate("allergens")
    .lean();

  const dishesMap = new Map(
    dishes.map((dish: any) => [dish._id.toString(), dish]),
  );

  return menuItems.map((item: any) => {
    const dish = dishesMap.get(item.dishId.toString()) as any;
    return {
      id: item._id.toString(),
      name: dish?.name || "Nepoznato jelo",
      description: dish?.description || "",
      allergens: dish?.allergens?.map((a: any) => a.name) || [],
      imageUrl: dish?.imageUrl || "",
    };
  });
}

export async function removeDishFromTodaysOffer(params: {
  menuItemId: string;
  updateDate: Date;
}): Promise<void> {
  await dbConnect();
  await MenuItem.findByIdAndUpdate(
    params.menuItemId,
    { $set: { available: false, lastServed: params.updateDate } },
    { new: true },
  );
  revalidatePath("/student/restaurants/[id]", "page");
  revalidatePath("/worker", "page");
}
