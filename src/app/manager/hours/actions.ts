"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import dbConnect from "@/utils/dbConnect";
import Restaurant from "@/models/Restaurant";

export async function getManagerRestaurant() {
    const { userId, sessionClaims } = await auth();
    if (!userId || sessionClaims?.metadata?.role !== "manager") {
        return { success: false, error: "Unauthorized" };
    }

    await dbConnect();

    try {
        const client = await clerkClient();
        const user = await client.users.getUser(userId);
        const restaurantId = user.publicMetadata?.restaurantId;

        if (!restaurantId) {
            return { success: false, error: "No restaurant assigned" };
        }

        const restaurant = await Restaurant.findById(restaurantId).lean();
        if (!restaurant) {
            return { success: false, error: "Restaurant not found" };
        }

        // Deep clone to remove Mongoose's non-plain objects (like Buffer-based _id)
        // that cause serialization errors in Client Components.
        const sanitizedData = JSON.parse(JSON.stringify(restaurant));

        return {
            success: true,
            data: sanitizedData,
        };
    } catch (error: any) {
        console.error("Error fetching manager restaurant:", error);
        return { success: false, error: error.message };
    }
}

export async function saveWorkingHours(restaurantId: string, workingHours: any) {
    const { userId, sessionClaims } = await auth();
    if (!userId || sessionClaims?.metadata?.role !== "manager") {
        return { success: false, error: "Unauthorized" };
    }

    await dbConnect();

    try {
        // Convert to database format & validate
        const formattedHours = Object.entries(workingHours).map(
            ([day, shifts]: [string, any]) => {
                const dayShifts = (shifts || []).filter((s: any) => s.start && s.end);

                // Validate time range
                for (const shift of dayShifts) {
                    if (shift.start >= shift.end) {
                        throw new Error(`Kraj smjene mora biti nakon početka.`);
                    }
                }

                return {
                    day: parseInt(day),
                    shifts: dayShifts,
                };
            }
        );

        const updated = await Restaurant.findByIdAndUpdate(restaurantId, {
            workingHours: formattedHours,
        });

        if (!updated) {
            return { success: false, error: "Restaurant not found" };
        }

        return { success: true };
    } catch (error: any) {
        console.error("Error saving working hours:", error);
        return { success: false, error: error.message };
    }
}
