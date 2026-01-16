"use server";
import { auth } from "@clerk/nextjs/server";
import Menu, { MenuItem } from "@/models/Menu";
import Dish from "@/models/Dish";
import dbConnect from "@/utils/dbConnect";

export interface WorkerMenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
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
  const menu = await Menu.findOne({ restaurantId: menzaId }).lean();
  const menuItems = await MenuItem.find({
    _id: { $in: menu?.items || [] },
  }).lean();
  const dishIds = menuItems.map((item) => item.dishId);
  const dishes = await Dish.find({
    _id: { $in: dishIds },
  }).lean();

  const dishesMap = new Map(dishes.map((dish: any) => [dish._id.toString(), dish]));

  return menuItems.map((item: any) => ({
    id: item._id.toString(),
    name: (dishesMap.get(item.dishId.toString()) as any)?.name || "Nepoznato jelo",
    description: (dishesMap.get(item.dishId.toString()) as any)?.description || "",
    allergens: (dishesMap.get(item.dishId.toString()) as any)?.allergens || [],
    category: (dishesMap.get(item.dishId.toString()) as any)?.category || "",
    imageUrl: (dishesMap.get(item.dishId.toString()) as any)?.imageUrl || "",
  }));
}

export async function fetchTodaysOfferDishIdsForMenza(
  menzaId: string,
): Promise<string[]> {
  await dbConnect();
  const menu = await Menu.findOne({ restaurantId: menzaId }).lean();
  const menuItems = await MenuItem.find({
    _id: { $in: menu?.items || [] },
  }).lean();

  return menuItems
    .filter((item) => item.available)
    .map((item) => item._id.toString());
}

import { sendDishNotification } from "@/actions/notification";

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

  // Send notification to subscribed students
  const timeString = params.updateDate.toLocaleTimeString("hr-HR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  await sendDishNotification(params.menuItemId, timeString);
}

export async function fetchTodaysOfferForMenza(
  menzaId: string,
): Promise<WorkerMenuItem[]> {
  await dbConnect();
  const menu = await Menu.findOne({ restaurantId: menzaId }).lean();
  const menuItems = await MenuItem.find({
    _id: { $in: menu?.items || [] },
  }).lean();

  const dishIds = menuItems.map((item) => item.dishId);
  const dishes = await Dish.find({
    _id: { $in: dishIds },
  }).lean();

  const dishesMap = new Map(dishes.map((dish: any) => [dish._id.toString(), dish]));

  return menuItems
    .filter((item: any) => item.available)
    .map((item: any) => ({
      id: item._id.toString(),
      name: (dishesMap.get(item.dishId.toString()) as any)?.name || "Nepoznato jelo",
      description: (dishesMap.get(item.dishId.toString()) as any)?.description || "",
      allergens: (dishesMap.get(item.dishId.toString()) as any)?.allergens || [],
      category: (dishesMap.get(item.dishId.toString()) as any)?.category || "",
      imageUrl: (dishesMap.get(item.dishId.toString()) as any)?.imageUrl || "",
    }));
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
}
