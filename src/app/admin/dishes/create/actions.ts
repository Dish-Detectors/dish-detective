"use server";

import { put } from "@vercel/blob";
import Dish from "../../../../models/Dish";
import dbConnect from "../../../../utils/dbConnect";
import { Types } from "mongoose";

type ActionResponse = {
  success: boolean;
  message: string;
  data?: any;
  errors?: Record<string, string>;
};

export async function createDish(formData: FormData): Promise<ActionResponse> {
  try {
    // Extract form data
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const allergensString = formData.get("allergens") as string;
    const imageFile = formData.get("image") as File | null;

    // Validate required fields
    if (!name || !description || !category) {
      return {
        success: false,
        message: "Missing required fields",
        errors: {
          name: !name ? "Name is required" : "",
          description: !description ? "Description is required" : "",
          category: !category ? "Category is required" : "",
        },
      };
    }

    // Parse allergens
    const allergens = allergensString
      ? allergensString
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean)
      : [];

    let imageUrl = "";

    // Upload image to Vercel Blob if provided
    if (imageFile && imageFile.size > 0) {
      try {
        // Generate a unique filename
        const timestamp = Date.now();
        const filename = `dishes/${timestamp}-${imageFile.name}`;

        // Upload to Vercel Blob
        const blob = await put(filename, imageFile, {
          access: "public",
        });

        imageUrl = blob.url;
      } catch (error) {
        console.error("Error uploading image:", error);
        return {
          success: false,
          message: "Failed to upload image",
          errors: { image: "Image upload failed" },
        };
      }
    }

    // Create dish in database
    const conn = await dbConnect();
    const DishModel = conn.model("Dish", Dish.schema);

    const dish = await DishModel.create({
      name: name.trim(),
      description: description.trim(),
      category: category.trim(),
      imageUrl: imageUrl,
      allergens: allergens,
      rating: 0,
      numRatings: 0,
    });

    return {
      success: true,
      message: "Dish created successfully",
      data: {
        id: (dish._id as Types.ObjectId).toString(),
        imageUrl: imageUrl,
      },
    };
  } catch (error: any) {
    console.error("Error creating dish:", error);

    // Handle duplicate name error
    if (error.code === 11000) {
      return {
        success: false,
        message: "A dish with this name already exists",
        errors: { name: "This name is already taken" },
      };
    }

    // Mongoose validation
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
      message: "Failed to create dish. Please try again.",
    };
  }
}
