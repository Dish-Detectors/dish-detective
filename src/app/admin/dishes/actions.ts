"use server";

import Dish from "../../../models/Dish";
import dbConnect from "../../../utils/dbConnect";
import { Types } from "mongoose";

type DishInput = {
  name: string;
  description: string;
  category: string;
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

    const dishes = await Dish.find({}).sort({ name: 1 }).lean().exec();

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
