"use server";

import Restaurant, {
  IWorkingDay,
} from "../../../../models/Restaurant";
import dbConnect from "../../../../utils/dbConnect";
import { Types } from "mongoose";
import { assignEmployee } from "../actions";

// Re-defining locally or importing? Let's redefine for now to avoid circular dependency issues if I mess up imports,
// but ideally should be shared.
// Actually, circular dependency is only an issue if A imports B and B imports A.
// create/actions imports actions.ts. actions.ts does NOT import create/actions. So it's safe to import types.
// BUT, I need to export them from actions.ts first.
// Since I haven't edited actions.ts yet, I can't import them.
// I will redefine them here for now, it's safer and cleaner than cross-file type imports sometimes.

type RestaurantInput = {
  name: string;
  address: string;
  manager?: string;
  imageUrl: string;
  workingHours: IWorkingDay[];
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

export async function createRestaurant(
  input: RestaurantInput,
): Promise<ActionResponse> {
  try {
    await dbConnect();

    const restaurant = await Restaurant.create({
      name: input.name.trim(),
      address: input.address.trim(),
      manager: input.manager?.trim(),
      imageUrl: input.imageUrl.trim(),
      workingHours: input.workingHours || [],
    });

    const restaurantId = (restaurant._id as Types.ObjectId).toString();

    // Assign Initial Staff if provided
    if (input.initialStaff && input.initialStaff.length > 0) {
      await Promise.all(
        input.initialStaff.map((staff) =>
          assignEmployee(staff.id, restaurantId, staff.role),
        ),
      );
    }

    return {
      success: true,
      message: "Restaurant created successfully",
      data: {
        id: restaurantId,
      },
    };
  } catch (error: any) {
    // Handle known errors without logging to console in non-dev environments if they are expected (like validation)
    // Or just log only if NOT a validation error to keep logs clean
    if (error.name !== "ValidationError" && error.code !== 11000) {
      console.error("Error creating restaurant:", error);
    }

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
