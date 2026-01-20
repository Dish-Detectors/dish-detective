"use server";

import Restaurant, { Location, IWorkingDay } from "../../../models/Restaurant";
import dbConnect from "../../../utils/dbConnect";
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

export async function createRestaurant(
  input: RestaurantInput,
): Promise<ActionResponse> {
  try {
    await dbConnect();

    const restaurant = await Restaurant.create({
      name: input.name.trim(),
      address: input.address.trim(),
      manager: input.manager?.trim(),
      location: input.location,
      imageUrl: input.imageUrl.trim(),
      workingHours: input.workingHours || [],
    });

    const restaurantId = (restaurant._id as Types.ObjectId).toString();

    // Assign Initial Staff if provided
    if (input.initialStaff && input.initialStaff.length > 0) {
      // We process them sequentially or parallel. Parallel is fine.
      // We reuse the assignEmployee logic but we can't call the exported action easily without context sometimes?
      // Actually we can call it.
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

// --- Staff Management Actions ---

import { clerkClient, auth } from "@clerk/nextjs/server";

export async function searchAvailableUsers(query: string) {
  // Deprecated in favor of getAvailableUsers for local filtering, but kept for compatibility if needed
  return getAvailableUsers();
}

export async function getAvailableUsers() {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const client = await clerkClient();
    // Fetch a larger batch of users to filter locally
    const users = await client.users.getUserList({
      limit: 499,
    });

    // Filter users who are NOT already assigned to a restaurant (no restaurantId)
    // AND excluding specific roles (admin, student).
    // This allows users with role=null or role=undefined (valid unassigned staff candidates).
    const availableUsers = users.data
      .filter((user) => {
        const metadata = user.publicMetadata as {
          restaurantId?: string;
          role?: string;
        };
        const restaurantId = metadata.restaurantId;
        const role = metadata.role;

        // Exclude if already assigned
        if (restaurantId) return false;

        // Exclude restricted roles
        if (role === "admin") return false;
        if (role === "student") return false;

        // Include everyone else (null, undefined, "worker" if unassigned, etc)
        return true;
      })
      .map((user) => ({
        id: user.id,
        name: user.firstName
          ? `${user.firstName} ${user.lastName || ""}`
          : user.username || "Unknown",
        username: user.username,
        email: user.emailAddresses[0]?.emailAddress,
      }));

    return { success: true, data: availableUsers };
  } catch (error) {
    console.error("Error searching users:", error);
    return { success: false, error: "Failed to search users" };
  }
}

export async function getRestaurantStaff(restaurantId: string) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const client = await clerkClient();
    // We can't query by metadata directly easily in all Clerk plans, but we can list users and filter?
    // efficiently: we might need to rely on the frontend filtering or fetch all?
    // Actually, getUserList supports `query`. But for metadata filter, it depends.
    // For now, let's fetch list (limitation: pagination).
    // Better approach: Since we don't store user IDs in Restaurant model (we should refactor this later possibly),
    // we query Clerk.
    // If we have many users, this is slow. But for this app size, fetching all and filtering might be okay?
    // Or just fetching "query" empty with limit 100?
    // A better way for production: Store staff IDs in Restaurant model.
    // BUT for now, following the existing pattern: Users store restaurantId.
    // We will fetch all users (limit 500?) and filter.

    // Attempting to filter by exact match on restaurant name or ID if Clerk supported it would be great.
    // Clerk backend API doesn't support filtering by metadata natively in the basic list call easily without specialized query syntax in stricter environments.
    // BUT we can iterate.

    const users = await client.users.getUserList({ limit: 499 });

    const staff = users.data
      .filter((user) => user.publicMetadata.restaurantId === restaurantId)
      .map((user) => ({
        id: user.id,
        name: user.firstName
          ? `${user.firstName} ${user.lastName || ""}`
          : user.username || "Unknown",
        role: user.publicMetadata.role as "manager" | "worker",
        email: user.emailAddresses[0]?.emailAddress,
      }));

    return { success: true, data: staff };
  } catch (error) {
    console.error("Error fetching staff:", error);
    return { success: false, error: "Failed to fetch staff" };
  }
}

export async function assignEmployee(
  userId: string,
  restaurantId: string,
  role: "manager" | "worker",
) {
  try {
    const { userId: adminId, sessionClaims } = await auth();
    if (!adminId || sessionClaims?.metadata?.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    const client = await clerkClient();

    // 1. Update User Metadata
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        restaurantId,
        role,
      },
    });

    // 2. If Manager, update Restaurant model string
    if (role === "manager") {
      await dbConnect();
      const user = await client.users.getUser(userId);
      const managerName = user.firstName
        ? `${user.firstName} ${user.lastName || ""}`
        : user.username || "Unknown";

      await Restaurant.findByIdAndUpdate(restaurantId, {
        manager: managerName,
      });
    }

    return { success: true, message: "User assigned successfully" };
  } catch (error) {
    console.error("Error assigning user:", error);
    return { success: false, error: "Failed to assign user" };
  }
}

export async function removeEmployee(userId: string, restaurantId: string) {
  try {
    const { userId: adminId, sessionClaims } = await auth();
    if (!adminId || sessionClaims?.metadata?.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    // 1. Remove Metadata
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        restaurantId: null,
        role: null,
      },
    });

    // 2. If they were a manager, check if there are other managers.
    // If this was the only manager, clear the specific manager string?
    // Or just clear it? The card displays "managerName".
    // If we remove *this* manager, we should probably update, but we don't know if there are others easily without fetching all.
    // Let's simple check: fetch all users for this restaurant, if any is manager, use their name. Else clear.

    if (user.publicMetadata.role === "manager") {
      // Wait for propagation or just re-fetch lists
      // Fetch remaining staff
      const allUsers = await client.users.getUserList({ limit: 499 });
      const managers = allUsers.data.filter(
        (u) =>
          u.publicMetadata.restaurantId === restaurantId &&
          u.publicMetadata.role === "manager" &&
          u.id !== userId,
      );

      let nextManagerName = "";
      if (managers.length > 0) {
        const m = managers[0];
        nextManagerName = m.firstName
          ? `${m.firstName} ${m.lastName || ""}`
          : m.username || "";
      }

      await dbConnect();
      await Restaurant.findByIdAndUpdate(restaurantId, {
        manager: nextManagerName, // Will be empty string if no other manager
      });
    }

    return { success: true, message: "User removed successfully" };
  } catch (error) {
    console.error("Error removing user:", error);
    return { success: false, error: "Failed to remove user" };
  }
}
