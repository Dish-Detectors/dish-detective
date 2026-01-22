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

import { sendPollNotifications } from "@/actions/notification";

export async function createPoll(formData: {
    title: string,
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
            title: formData.title,
            questions: formData.questions,
            restaurantId: restaurantId,
            createdBy: userId,
        });

        const pollIdStr = (poll as any)._id.toString();

        // 4. Create Notifications (Database)
        const dbNotifications = selectedUsers.map(targetUserId => ({
            title: "Nova anketa dostupna!",
            description: `Imamo nekoliko pitanja o hrani u restoranu ${restaurant.name}: "${formData.title}"`,
            type: "student",
            postedBy: userId,
            targetUserId: targetUserId,
            pollId: pollIdStr,
            restaurantId: restaurantId,
            imageUrl: restaurant.imageUrl,
            read: false,
        }));

        await Notification.insertMany(dbNotifications);

        // 5. Send Push Notifications
        try {
            await sendPollNotifications({
                pollId: pollIdStr,
                pollTitle: formData.title,
                targetUserIds: selectedUsers,
                restaurantName: restaurant.name
            });
        } catch (pushError) {
            console.error("Failed to send poll push notifications:", pushError);
            // We don't fail the whole creation if push fails
        }

        return { success: true, count: selectedUsers.length };

    } catch (error) {
        console.error("Error creating poll:", error);
        return { error: "Failed to create poll" };
    }
}

export async function fetchManagerPolls() {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    try {
        const client = await clerkClient();
        const user = await client.users.getUser(userId);
        const restaurantId = user.publicMetadata.restaurantId as string;

        if (!restaurantId) return { error: "Manager not assigned to any restaurant" };

        await dbConnect();
        const polls = await Poll.find({ restaurantId }).sort({ createdAt: -1 });

        return { polls: JSON.parse(JSON.stringify(polls)) };
    } catch (error) {
        console.error("Error fetching polls:", error);
        return { error: "Failed to fetch polls" };
    }
}

export async function getPollResults(pollId: string) {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    try {
        await dbConnect();
        const poll = await Poll.findById(pollId);
        if (!poll) return { error: "Poll not found" };

        const answers = await (mongoose.models.Answers || mongoose.model("Answers")).find({ pollId });

        // Aggregate results
        const results = poll.questions.map((questionText) => {
            const counts = [0, 0, 0, 0, 0]; // For ratings 1, 2, 3, 4, 5
            answers.forEach((ans) => {
                const qAns = ans.answers.find((a: any) => a.question === questionText);
                if (qAns && qAns.rating >= 1 && qAns.rating <= 5) {
                    counts[qAns.rating - 1]++;
                }
            });
            return {
                question: questionText,
                data: [
                    { rating: 1, count: counts[0] },
                    { rating: 2, count: counts[1] },
                    { rating: 3, count: counts[2] },
                    { rating: 4, count: counts[3] },
                    { rating: 5, count: counts[4] },
                ]
            };
        });

        return {
            poll: JSON.parse(JSON.stringify(poll)),
            results,
            totalAnswers: answers.length
        };

    } catch (error) {
        console.error("Error getting poll results:", error);
        return { error: "Failed to get poll results" };
    }
}
