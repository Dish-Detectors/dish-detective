"use server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import Restaurant from "@/models/Restaurant";
import Menu, { MenuItem } from "@/models/Menu";
import Dish from "@/models/Dish";
import Allergen from "@/models/Allergen";
import dbConnect from "@/utils/dbConnect";

export interface WorkerMenuItem {
  id: string;
  name: string;
  description: string;

  imageUrl: string;
  allergens: string[];
  available?: boolean;
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
import { sendDishNotification } from "@/actions/notification";

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
      available: item.available,
    };
  });
}

export async function toggleDishAvailability(params: {
  menuItemId: string;
  available: boolean;
  updateDate: Date;
}): Promise<void> {
  await dbConnect();

  const menuItem = await MenuItem.findByIdAndUpdate(
    params.menuItemId,
    { $set: { available: params.available, lastServed: params.updateDate } },
    { new: true },
  );

  if (menuItem && params.available) {
    const timeString = params.updateDate.toLocaleTimeString("hr-HR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    // Send notification when dish becomes available
    await sendDishNotification(params.menuItemId, timeString);
  }

  revalidatePath("/student/restaurants/[id]", "page");
  revalidatePath("/worker", "page");
}
