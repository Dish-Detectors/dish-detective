"use server";

import { auth } from "@clerk/nextjs/server";
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

        await dbConnect();
        const restaurant = await Restaurant.findOne({ manager: userId });
        if (!restaurant) return { count: 0, error: "Restaurant not found" };
        const restaurantId = restaurant._id;

        // 1. Get all menus for this restaurant
        const menus = await Menu.find({ restaurantId });
        const menuIds = menus.map((m) => m._id);

        const count = await Subscription.aggregate([
            {
                $lookup: {
                    from: "menuitems", // assuming collection name
                    localField: "menuItemId",
                    foreignField: "_id",
                    as: "menuItem"
                }
            },
            { $unwind: "$menuItem" },
            {
                $lookup: {
                    from: "menus",
                    localField: "menuItem.menuId",
                    foreignField: "_id",
                    as: "menu"
                }
            },
            { $unwind: "$menu" },
            {
                $match: {
                    "menu.restaurantId": new mongoose.Types.ObjectId(restaurantId as string)
                }
            },
            {
                $group: {
                    _id: "$userId"
                }
            },
            {
                $count: "total"
            }
        ]);

        return { count: count[0]?.total || 0 };

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
        await dbConnect();
        const restaurant = await Restaurant.findOne({ manager: userId });
        if (!restaurant) return { error: "Restaurant not found" };
        const restaurantId = restaurant._id;

        // 1. Get distinct eligible users
        const eligibleUsers = await Subscription.aggregate([
            {
                $lookup: {
                    from: "menuitems",
                    localField: "menuItemId",
                    foreignField: "_id",
                    as: "menuItem"
                }
            },
            { $unwind: "$menuItem" },
            {
                $lookup: {
                    from: "menus",
                    localField: "menuItem.menuId",
                    foreignField: "_id",
                    as: "menu"
                }
            },
            { $unwind: "$menu" },
            {
                $match: {
                    "menu.restaurantId": new mongoose.Types.ObjectId(restaurantId as string)
                }
            },
            {
                $group: {
                    _id: "$userId"
                }
            }
        ]);

        const userIds = eligibleUsers.map(u => u._id);

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
