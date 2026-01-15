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
    const dishRating = await DishRating.findOne({dishId: params.dishId, userId: userId});
    
    if (!dishRating) {
        const DishRatingModel = conn.model("DishRating", Dish.schema);

        const dishRating = await DishRatingModel.create({
          dishId: params.dishId,
        ratings: params.rating,
        userId : userId
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