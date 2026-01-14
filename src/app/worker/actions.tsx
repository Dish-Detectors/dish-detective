'use server'
import { auth } from "@clerk/nextjs/server";
import User from "@/models/User";
import Menu, { MenuItem } from "@/models/Menu";
import Dish from "@/models/Dish";
import dbConnect from "@/utils/dbConnect";

export interface MenuItem {
    id: string;
    name: string;
    description: string;
    category: string;
    imageUrl: string;
    allergens: string[];
  }
  
export async function getWorkerMenzaId(): Promise<string> {
    const { userId } = await auth();
    await dbConnect();
    const user = await User.findOne({ clerkId: userId }).lean();
    if (user !== null && user.restaurantId !== undefined) {
        return user.restaurantId;
    }
    // TODO: some kind of error?
    return "";
};


export async function fetchAllDishesForMenza(
    menzaId: string,
): Promise<MenuItem[]> {
    await dbConnect();
    const menu = await Menu.findOne({ restaurantId: menzaId }).lean();
    const menuItems = await MenuItem.find({
        _id: { $in: menu?.items || [] }
    });
    const dishIds = menuItems.map(item => item.dishId);
    const dishes = await Dish.find({ 
        _id: { $in: dishIds } 
    });
    const dishesMap = new Map(dishes.map(dish => [dish.id, dish]));;
    return menuItems.map((item) => ({
        id: item.id,
        name: dishesMap.get(item.dishId.toString())?.name || "Nepoznato jelo",
        description: dishesMap.get(item.dishId.toString())?.description || "",
        allergens: dishesMap.get(item.dishId.toString())?.allergens || [],
        category: dishesMap.get(item.dishId.toString())?.category || "",
        imageUrl: dishesMap.get(item.dishId.toString())?.imageUrl || "",
    })) || [];
}

export async function fetchTodaysOfferDishIdsForMenza(menzaId: string): Promise<string[]> {
    await dbConnect();
    const menu = await Menu.findOne({ restaurantId: menzaId }).lean();
    const menuItems = await MenuItem.find({
        _id: { $in: menu?.items || [] }
    }).lean();

    return menuItems.filter((item) => (item.available)).map((item) => (item._id.toString())) || [];
}


export async function addDishToTodaysOffer(params: {
    menuItemId: string;
    updateDate: Date;
}): Promise<void> {
    await dbConnect();
    await MenuItem.findByIdAndUpdate(
        params.menuItemId,
        { $set: { available: true, lastServed: params.updateDate } },
        { new: true }
    );
}


export async function fetchTodaysOfferForMenza(menzaId: string): Promise<MenuItem[]> {
    await dbConnect();
    const menu = await Menu.findOne({ restaurantId: menzaId }).lean();
    const menuItems = await MenuItem.find({
        _id: { $in: menu?.items || [] }
    });
    const dishIds = menuItems.map(item => item.dishId);
    const dishes = await Dish.find({ 
        _id: { $in: dishIds } 
    });
    const dishesMap = new Map(dishes.map(dish => [dish.id, dish]));;
    return menuItems.filter(item => (item.available)).map((item) => ({
        id: item.id,
        name: dishesMap.get(item.dishId.toString())?.name || "Nepoznato jelo",
        description: dishesMap.get(item.dishId.toString())?.description || "",
        allergens: dishesMap.get(item.dishId.toString())?.allergens || [],
        category: dishesMap.get(item.dishId.toString())?.category || "",
        imageUrl: dishesMap.get(item.dishId.toString())?.imageUrl || "",
    })) || [];
}


export async function removeDishFromTodaysOffer(params: {
    menuItemId: string;
    updateDate: Date;
}): Promise<void> {
    await dbConnect();
    await MenuItem.findByIdAndUpdate(
        params.menuItemId,
        { $set: { available: false, lastServed: params.updateDate } },
        { new: true }
    );
}
