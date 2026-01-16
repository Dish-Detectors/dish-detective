"use server";

import Restaurant, { Location, IWorkingDay } from "../../../models/Restaurant";
import dbConnect from "../../../utils/dbConnect";
import { Types } from "mongoose";

type RestaurantInput = {
  name: string;
  address: string;
  imageUrl: string;
  workingHours: IWorkingDay[];
  location: Location;
};

type ActionResponse = {
  success: boolean;
  message: string;
  data?: any;
  errors?: Record<string, string>;
};

export async function createRestaurant(
  input: RestaurantInput,
): Promise<ActionResponse> {
  try {
    await dbConnect();

    const restaurant = await Restaurant.create({
      name: input.name.trim(),
      address: input.address.trim(),
      location: input.location,
      imageUrl: input.imageUrl.trim(),
      workingHours: input.workingHours || [],
    });

    return {
      success: true,
      message: "Restaurant created successfully",
      data: {
        id: (restaurant._id as Types.ObjectId).toString(),
      },
    };
  } catch (error: any) {
    console.error("Error creating restaurant:", error);

    // Handle duplicate name error
    if (error.code === 11000) {
      return {
        success: false,
        message: "A restaurant with this name already exists",
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
      message: "Failed to create restaurant. Please try again.",
    };
  }
}

export async function deleteRestaurant(
  restaurantId: string,
): Promise<ActionResponse> {
  try {
    await dbConnect();

    const deletedRestaurant = await Restaurant.findByIdAndDelete(restaurantId);

    if (!deletedRestaurant) {
      return {
        success: false,
        message: "Restaurant not found",
      };
    }

    return {
      success: true,
      message: "Restaurant deleted successfully",
      data: {
        id: (deletedRestaurant._id as Types.ObjectId).toString(),
      },
    };
  } catch (error: any) {
    console.error("Error deleting restaurant:", error);

    if (error.name === "CastError") {
      return {
        success: false,
        message: "Invalid restaurant ID format",
      };
    }

    return {
      success: false,
      message: "Failed to delete restaurant. Please try again.",
    };
  }
}

export async function getAllRestaurants(): Promise<ActionResponse> {
  try {
    await dbConnect();

    const restaurants = await Restaurant.find({})
      .sort({ name: 1 })
      .lean()
      .exec();

    // Sanitize to remove Mongoose special objects (Buffers, etc.)
    const serializedRestaurants = JSON.parse(JSON.stringify(restaurants));

    return {
      success: true,
      message: `Retrieved ${restaurants.length} restaurants`,
      data: serializedRestaurants,
    };
  } catch (error: any) {
    console.error("Error retrieving restaurants:", error);

    return {
      success: false,
      message: "Failed to retrieve restaurants. Please try again.",
    };
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
