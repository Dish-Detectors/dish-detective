"use server";

import Restaurant, { Location, IWorkingDay } from "../../../models/Restaurant";
import dbConnect from "../../../utils/dbConnect";
import { auth, clerkClient } from "@clerk/nextjs/server";
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

export async function getManagerForRestaurant(
  restaurantId: string,
): Promise<ActionResponse> {
  try {
    // Verify the current user is an admin
    const { userId, sessionClaims } = await auth();
    if (!userId) {
      return { success: false, message: "Unauthorized" };
    }

    if (sessionClaims?.metadata?.role !== "admin") {
      return {
        success: false,
        message: "Only admins can view employee accounts",
      };
    }

    const client = await clerkClient();

    // Fetch all users from Clerk
    // Note: In a large app, you'd use pagination or filter by metadata if Clerk supports it directly in listUsers
    const clerkUsersResponse = await client.users.getUserList({
      limit: 100, // Adjust as needed
    });

    const employees = clerkUsersResponse.data.filter(
      (user) =>
        user.publicMetadata.role === "manager" ||
        user.publicMetadata.role === "worker",
    );

    if (employees.length === 0) {
      return {
        success: true,
        message: "No employees found",
        data: [],
      };
    }

    await dbConnect();

    // Fetch data for each employee
    const employeeDataPromises = employees.map(async (clerkUser) => {
      try {
        const restaurantId = clerkUser.publicMetadata.restaurantId as string;
        return {
          id: clerkUser.id,
          firstName: clerkUser.firstName || "",
          lastName: clerkUser.lastName || "",
          restaurantId,
          role: clerkUser.publicMetadata.role as "manager" | "worker",
        };
      } catch (error) {
        console.error(
          `Error fetching data for employee ${clerkUser.id}:`,
          error,
        );
        return {
          id: clerkUser.id,
          firstName: clerkUser.firstName || "Unknown",
          lastName: clerkUser.lastName || "Unknown",
          restaurantId: "Unknown",
          role: clerkUser.publicMetadata.role as "manager" | "worker",
        };
      }
    });

    const employeeData = await Promise.all(employeeDataPromises);

    let userids: string[] = [];
    for (const employee of employeeData) {
      if (
        employee.restaurantId &&
        Types.ObjectId.isValid(employee.restaurantId) &&
        employee.restaurantId === restaurantId
      ) {
        userids.push(employee.id);
      } else {
        userids = ["Unknown"];
      }
    }

    return {
      success: true,
      message: `Retrieved ${userids} manager of restaurant ${restaurantId}`,
      data: userids,
    };
  } catch (error: any) {
    console.error("Error retrieving employees:", error);
    return {
      success: false,
      message: "Failed to retrieve employee accounts",
    };
  }
}
