"use server";

import Restaurant, {
  Location,
  IWorkingDay,
} from "../../../../models/Restaurant";
import dbConnect from "../../../../utils/dbConnect";
import { Types } from "mongoose";

type RestaurantInput = {
  name: string;
  address: string;
  manager?: string;
  imageUrl: string;
  workingHours: IWorkingDay[];
  location: Location;
  initialStaff?: {
    id: string;
    role: "manager" | "worker";
  }[];
};

type ActionResponse = {
  success: boolean;
  message: string;
  data?: any;
  errors?: Record<string, string>;
};

export async function getRestaurant(id: string): Promise<ActionResponse> {
  try {
    await dbConnect();
    const restaurant = await Restaurant.findById(id).lean();
    if (!restaurant) {
      return { success: false, message: "Restaurant not found" };
    }
    return {
      success: true,
      message: "Restaurant found",
      data: JSON.parse(JSON.stringify(restaurant)),
    };
  } catch (error: any) {
    console.error("Error retrieving restaurant:", error);
    return { success: false, message: "Failed to retrieve restaurant" };
  }
}

export async function updateRestaurant(
  restId: string,
  input: Partial<RestaurantInput>,
): Promise<ActionResponse> {
  try {
    await dbConnect();

    // Update only whats provided
    const updateData: any = {};
    if (input.name !== undefined) updateData.name = input.name.trim();
    if (input.address !== undefined) updateData.address = input.address.trim();
    if (input.workingHours !== undefined)
      updateData.workingHours = input.workingHours;
    if (input.imageUrl !== undefined)
      updateData.imageUrl = input.imageUrl.trim();
    if (input.manager !== undefined) updateData.manager = input.manager.trim();
    if (input.location !== undefined) updateData.location = input.location;

    const updatedRest = await Restaurant.findByIdAndUpdate(restId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedRest) {
      return {
        success: false,
        message: "Rest not found",
      };
    }

    return {
      success: true,
      message: "Rest updated successfully",
      data: {
        id: (updatedRest._id as Types.ObjectId).toString(),
      },
    };
  } catch (error: any) {
    console.error("Error updating restaurant:", error);

    // Handle duplicate name error
    if (error.code === 11000) {
      return {
        success: false,
        message: "A restaurant with this name already exists",
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

    if (error.name === "CastError") {
      return {
        success: false,
        message: "Invalid restaurant ID format",
      };
    }

    return {
      success: false,
      message: "Failed to update restaurant. Please try again.",
    };
  }
}
