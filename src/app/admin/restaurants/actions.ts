"use server";

import Restaurant from "../../../models/Restaurant";
import dbConnect from "../../../utils/dbConnect";
import { Types } from "mongoose";
import { clerkClient, auth } from "@clerk/nextjs/server";

// Export types if needed elsewhere, though redundancy in create/edit is fine for now
export type ActionResponse = {
  success: boolean;
  message: string;
  data?: any;
  errors?: Record<string, string>;
};

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

// --- Staff Management Actions ---

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
