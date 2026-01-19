"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import Restaurant from "@/models/Restaurant";
import dbConnect from "@/utils/dbConnect";

export async function getCurrentUserFirstName() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, firstName: null, error: "Not authenticated" };
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    return {
      success: true,
      firstName: user.firstName || "",
      error: null,
    };
  } catch (error) {
    console.error("Error fetching user first name:", error);
    return {
      success: false,
      firstName: null,
      error: "Failed to fetch user information",
    };
  }
}

export async function getRestaurantName() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, name: null, error: "Not authenticated" };
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const restaurantId = user.publicMetadata?.restaurantId as string;

    if (!restaurantId) {
      return { success: false, name: null, error: "No restaurant assigned" };
    }

    await dbConnect();
    const restaurant = await Restaurant.findById(restaurantId).lean();

    if (!restaurant || !(restaurant as any).name) {
      return { success: false, name: null, error: "Restaurant not found" };
    }

    return {
      success: true,
      name: (restaurant as any).name as string,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching restaurant name:", error);
    return {
      success: false,
      name: null,
      error: "Failed to fetch restaurant information",
    };
  }
}
