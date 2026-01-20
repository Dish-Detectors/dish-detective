"use server";

import Dish from "../../../../models/Dish";
import dbConnect from "../../../../utils/dbConnect";
import { Types } from "mongoose";

type DishInput = {
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  allergens: string[]; // Array of Allergen IDs
};

type ActionResponse = {
  success: boolean;
  message: string;
  data?: any;
  errors?: Record<string, string>;
};

export async function updateDish(
  dishId: string,
  input: Partial<DishInput>,
): Promise<ActionResponse> {
  try {
    await dbConnect();

    // Validate id
    if (!Types.ObjectId.isValid(dishId)) {
      return {
        success: false,
        message: "Invalid dish ID format",
        errors: { id: "Invalid ObjectId format" },
      };
    }

    // Update only whats provided
    const updateData: any = {};
    if (input.name !== undefined) updateData.name = input.name.trim();
    if (input.description !== undefined)
      updateData.description = input.description.trim();
    if (input.category !== undefined)
      updateData.category = input.category.trim();
    if (input.imageUrl !== undefined)
      updateData.imageUrl = input.imageUrl.trim();
    if (input.allergens !== undefined) updateData.allergens = input.allergens;

    const updatedDish = await Dish.findByIdAndUpdate(dishId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedDish) {
      return {
        success: false,
        message: "Dish not found",
      };
    }

    return {
      success: true,
      message: "Dish updated successfully",
      data: {
        id: (updatedDish._id as Types.ObjectId).toString(),
        name: updatedDish.name,
      },
    };
  } catch (error: any) {
    console.error("Error updating dish:", error);

    // Handle duplicate name error
    if (error.code === 11000) {
      return {
        success: false,
        message: "A dish with this name already exists",
        errors: { name: "This name is already taken" },
      };
    }

    if (error.name === "ValidationError") {
      const errors: Record<string, string> = {};
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });

      return {
        success: false,
        message: "Validation failed",
        errors,
      };
    }

    return {
      success: false,
      message: "Failed to update dish. Please try again.",
    };
  }
}
