"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import dbConnect from "@/utils/dbConnect";
import Restaurant from "@/models/Restaurant";
import Menu from "@/models/Menu";
import Subscription from "@/models/Subscription";
import Poll from "@/models/Poll";
import Notification from "@/models/Notification";
import mongoose from "mongoose";

export async function getEligibleStudentCount() {
    try {
        const { userId } = await auth();
        if (!userId) return { count: 0, error: "Unauthorized" };

        const client = await clerkClient();
        const user = await client.users.getUser(userId);
        const restaurantId = user.publicMetadata.restaurantId as string;

        if (!restaurantId) return { count: 0, error: "Manager not assigned to any restaurant" };

        await dbConnect();
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) return { count: 0, error: "Restaurant not found" };

        const availableDishIds = restaurant.availableDishes.map(id => id.toString());

        const eligibleUsers = await Subscription.distinct("userId", {
            dishId: { $in: availableDishIds }
        });

        return { count: eligibleUsers.length };

    } catch (error) {
        console.error("Error getting eligible count:", error);
        return { count: 0, error: "Failed to count students" };
    }
}

export async function createPoll(formData: {
    questions: string[],
    percentage: number,
}) {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    try {
        const client = await clerkClient();
        const user = await client.users.getUser(userId);
        const restaurantId = user.publicMetadata.restaurantId as string;

        if (!restaurantId) return { error: "Manager not assigned to any restaurant" };

        await dbConnect();
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) return { error: "Restaurant not found" };

        const availableDishIds = restaurant.availableDishes.map(id => id.toString());

        // 1. Get distinct eligible users based on dish subscriptions
        const userIds = await Subscription.distinct("userId", {
            dishId: { $in: availableDishIds }
        });

        if (userIds.length === 0) {
            return { error: "No eligible students found" };
        }

        // 2. Select random users based on percentage
        const usersToSelectCount = Math.max(1, Math.ceil(userIds.length * (formData.percentage / 100)));

        // Shuffle array
        const shuffled = userIds.sort(() => 0.5 - Math.random());
        const selectedUsers = shuffled.slice(0, usersToSelectCount);

        // 3. Create Poll
        const poll = await Poll.create({
            questions: formData.questions,
            restaurantId: restaurantId,
            createdBy: userId,
        });

        // 4. Create Notifications
        const notifications = selectedUsers.map(targetUserId => ({
            title: "Nova anketa dostupna!",
            description: "Imamo nekoliko pitanja o hrani u tvojoj omiljenoj menzi.",
            type: "student",
            postedBy: userId,
            targetUserId,
            pollId: (poll as any)._id.toString(),
            read: false,
        }));

        await Notification.insertMany(notifications);

        return { success: true, count: selectedUsers.length };

    } catch (error) {
        console.error("Error creating poll:", error);
        return { error: "Failed to create poll" };
    }
}
