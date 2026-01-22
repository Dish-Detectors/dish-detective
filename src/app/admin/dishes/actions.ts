"use server";

import Dish from "../../../models/Dish";
import Allergen from "../../../models/Allergen";
import dbConnect from "../../../utils/dbConnect";
import { Types } from "mongoose";
import { revalidatePath } from "next/cache";

type DishInput = {
  name: string;
  description: string;

  imageUrl: string;
  allergens: string[];
};

type ActionResponse = {
  success: boolean;
  message: string;
  data?: any;
  errors?: Record<string, string>;
};

export async function deleteDish(dishId: string): Promise<ActionResponse> {
  try {
    await dbConnect();

    const deletedDish = await Dish.findByIdAndDelete(dishId);

    if (!deletedDish) {
      return {
        success: false,
        message: "Dish not found",
      };
    }

    revalidatePath("/admin/dishes");
    return {
      success: true,
      message: "Dish deleted successfully",
      data: {
        id: (deletedDish._id as Types.ObjectId).toString(),
      },
    };
  } catch (error: any) {
    console.error("Error deleting dish:", error);

    return {
      success: false,
      message: "Failed to delete dish. Please try again.",
    };
  }
}

export async function getAllDishes(): Promise<ActionResponse> {
  try {
    await dbConnect();

    const dishes = await Dish.find({})
      .sort({ name: 1 })
      .populate("allergens") // Populate allergen details
      .lean()
      .exec();

    // Sanitize to remove Mongoose special objects
    const serializedDishes = JSON.parse(JSON.stringify(dishes));

    return {
      success: true,
      message: `Retrieved ${dishes.length} dishes`,
      data: serializedDishes,
    };
  } catch (error: any) {
    console.error("Error retrieving dishes:", error);

    return {
      success: false,
      message: "Failed to retrieve dishes. Please try again.",
    };
  }
}

// Allergen Actions

export async function getAllAllergens() {
  await dbConnect();
  try {
    const allergens = await Allergen.find({}).sort({ name: 1 }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(allergens)) };
  } catch (error) {
    console.error("Error fetching allergens:", error);
    return { success: false, message: "Failed to fetch allergens" };
  }
}

export async function createAllergen(name: string) {
  await dbConnect();
  try {
    const existing = await Allergen.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
    if (existing) {
      return { success: false, message: "Allergen already exists" };
    }
    const allergen = await Allergen.create({ name });
    revalidatePath("/admin/dishes");
    return { success: true, data: JSON.parse(JSON.stringify(allergen)) };
  } catch (error) {
    console.error("Error creating allergen:", error);
    return { success: false, message: "Failed to create allergen" };
  }
}

export async function deleteAllergen(id: string) {
  await dbConnect();
  try {
    await Allergen.findByIdAndDelete(id);
    revalidatePath("/admin/dishes");
    return { success: true };
  } catch (error) {
    console.error("Error deleting allergen:", error);
    return { success: false, message: "Failed to delete allergen" };
  }
}
