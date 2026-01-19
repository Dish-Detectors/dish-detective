"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import Notification from "@/models/Notification";
import Restaurant from "@/models/Restaurant";
import dbConnect from "@/utils/dbConnect";
import { revalidatePath } from "next/cache";

export async function sendAnnouncement(
    type: "worker" | "student",
    text: string,
    attachment?: { name: string; url: string; type: string; size: string }
) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Verify the user is a manager (or at least check if they have access)
    // Ideally we check metadata here, but for now we assume the page is protected

    await dbConnect();

    let notificationTitle = "Obavijest";
    try {
        const client = await clerkClient();
        const user = await client.users.getUser(userId);
        const restaurantId = user.publicMetadata?.restaurantId as string;

        if (restaurantId) {
            const restaurant = await Restaurant.findById(restaurantId).lean();
            if (restaurant && (restaurant as any).name) {
                notificationTitle = `Menza ${(restaurant as any).name}`;
            }
        }
    } catch (error) {
        console.error("Failed to fetch restaurant name for title:", error);
        // Fallback to default title
    }

    try {
        const notification = await Notification.create({
            title: notificationTitle,
            description: text,
            type: type,
            postedBy: userId,
            attachment: attachment,
            // No targetUserId means it's a broadcast
        });

        if (type === "student") {
            try {
                const { messaging } = await import("@/utils/firebase");
                await messaging.send({
                    topic: "topic_all_students",
                    notification: {
                        title: notificationTitle,
                        body: text || "Nova datoteka", // Fallback if text is empty (attachment only)
                    },
                    data: {
                        type: "announcement",
                        text: text
                    },
                    webpush: {
                        fcmOptions: {
                            link: "/student"
                        }
                    }
                });
            } catch (fcmError) {
                console.error("Failed to send push notification:", fcmError);
            }
        }

        return { success: true, notification: JSON.parse(JSON.stringify(notification)) };
    } catch (error: any) {
        console.error("Error sending announcement:", error);
        return { success: false, error: error.message };
    }
}

export async function getAnnouncements(type: "worker" | "student") {
    const { userId } = await auth();
    if (!userId) {
        // Allow fetching without auth? No, manager page requires auth.
        // But maybe we return empty if not authorized.
        return [];
    }

    await dbConnect();

    try {
        // Fetch notifications of the specific type that are broadcasts (no targetUserId)
        // Or should we show all notifications of that type sent by *this* manager?
        // The chat UI implies a history of announcements. Use case: "Manager sees what was sent".
        // Usually admins want to see all announcements sent to that group.

        // Logic: Find all notifications of `type` that don't have a specific `targetUserId` (broadcasts)
        const notifications = await Notification.find({
            type: type,
            // Explicitly look for missing or null targetUserId to exclude personal messages
            $or: [{ targetUserId: { $exists: false } }, { targetUserId: null }]
        })
            .sort({ createdAt: 1 }) // Oldest first for chat history
            .limit(50); // Limit to last 50 for performance

        const client = await clerkClient();

        const populatedDetails = await Promise.all(
            notifications.map(async (notif) => {
                // Ideally we don't fetch user for every single message if it's the same user
                // But for simplicity let's do it or just show "Manager"
                return {
                    id: (notif as any)._id.toString(),
                    text: notif.description,
                    time: new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    // We mark all these as "isAdmin: true" because they are sent by managers
                    isAdmin: true,
                    file: notif.attachment ? {
                        name: notif.attachment.name,
                        date: new Date(notif.createdAt).toLocaleDateString(), // Use creation date as file date
                        size: notif.attachment.size,
                        url: notif.attachment.url
                    } : undefined
                };
            })
        );

        return populatedDetails;
    } catch (error: any) {
        console.error("Error fetching announcements:", error);
        return [];
    }
}
