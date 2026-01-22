"use server";

import Subscription from "@/models/Subscription";
import dbConnect from "@/utils/dbConnect";

export async function getSubscriptionCountsForMenuItems(
  dishIds: string[],
): Promise<Record<string, number>> {
  await dbConnect();

  try {
    const counts = await Subscription.aggregate([
      {
        $match: {
          dishId: { $in: dishIds.map((id) => new (Subscription as any).base.Types.ObjectId(id)) },
        },
      },
      {
        $group: {
          _id: "$dishId",
          count: { $sum: 1 },
        },
      },
    ]);

    const result: Record<string, number> = {};
    dishIds.forEach((id) => {
      result[id] = 0;
    });

    counts.forEach((c) => {
      result[c._id.toString()] = c.count;
    });

    return result;
  } catch (error) {
    console.error("Error fetching subscription counts:", error);
    return Object.fromEntries(dishIds.map((id) => [id, 0]));
  }
}

export async function getManagerSubscriptionCounts(restaurantId: string): Promise<Record<string, number>> {
  await dbConnect();

  try {
    // Only count subscriptions for dishes that are actually "available" in this restaurant
    // or just any dish that has subscriptions?
    // User said "koliko je ljudi pretplaceno na sto"
    // Usually managers want to see subscriptions for ALL dishes in the system to know what to put on menu
    // OR only for dishes THEY offer.
    // The current page fetches ALL dishes via getAllDishes(), so we should probably support that.

    const counts = await Subscription.aggregate([
      {
        $group: {
          _id: "$dishId",
          count: { $sum: 1 },
        },
      },
    ]);

    const result: Record<string, number> = {};
    counts.forEach((c) => {
      result[c._id.toString()] = c.count;
    });

    return result;
  } catch (error) {
    console.error("Error fetching manager subscription counts:", error);
    return {};
  }
}
