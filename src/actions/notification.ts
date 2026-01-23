"use server";
import { clerkClient, auth } from "@clerk/nextjs/server";
import Notification, { INotification } from "@/models/Notification";
import ReadReceipt from "@/models/ReadReceipt";
import Subscription from "@/models/Subscription";
import dbConnect from "@/utils/dbConnect";
import { messaging } from "@/utils/firebase";
import Menu, { MenuItem } from "@/models/Menu";
import Dish from "@/models/Dish";
import Restaurant from "@/models/Restaurant";

export async function getAllWorkerNotifications(): Promise<any[]> {
  const { userId } = await auth();
  if (!userId) return []; // Workers are users too
  await dbConnect();

  const notifications = await Notification.find({ type: "worker" })
    .sort({ createdAt: -1 })
    .lean();

  if (!notifications.length) return [];

  const readReceipts = await ReadReceipt.find({ userId }).lean();
  const readSet = new Set(readReceipts.map((r) => r.notificationId.toString()));

  const client = await clerkClient();

  const populatedNotifications = await Promise.all(
    notifications.map(async (notif: any) => {

      const isRead = notif.targetUserId
        ? notif.read
        : readSet.has(notif._id.toString());

      try {
        const user = await client.users.getUser(notif.postedBy);
        return {
          ...JSON.parse(JSON.stringify(notif)),
          read: isRead,
          postedBy: `${user.firstName || "Nepoznato ime"} ${user.lastName || "Nepoznato prezime"}`,
        };
      } catch (e) {
        return { ...JSON.parse(JSON.stringify(notif)), read: isRead };
      }
    }),
  );

  return populatedNotifications;
}

export async function getAllStudentNotifications(): Promise<any[]> {
  const { userId } = await auth();
  if (!userId) return [];

  await dbConnect();

  const notifications = await Notification.find({
    type: "student",
    $or: [
      { targetUserId: userId },
      { targetUserId: { $exists: false } },
      { targetUserId: null },
    ],
  })
    .sort({ createdAt: -1 })
    .lean();

  if (!notifications.length) return [];

  const readReceipts = await ReadReceipt.find({ userId }).lean();
  const readSet = new Set(readReceipts.map((r) => r.notificationId.toString()));

  const client = await clerkClient();

  const populatedNotifications = await Promise.all(
    notifications.map(async (notif: any) => {

      const isBroadcast = !notif.targetUserId;
      const isRead = isBroadcast
        ? readSet.has(notif._id.toString())
        : notif.read;

      try {
        const user = await client.users.getUser(notif.postedBy);
        return {
          ...JSON.parse(JSON.stringify(notif)),
          read: isRead,
          postedBy: `${user.firstName || "Nepoznato ime"} ${user.lastName || "Nepoznato prezime"}`,
        };
      } catch (e) {
        return { ...JSON.parse(JSON.stringify(notif)), read: isRead };
      }
    }),
  );

  return populatedNotifications;
}

export async function sendDishNotification(
  menuItemId: string,
  availableFrom: string,
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await dbConnect();

  try {
    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) throw new Error("Menu item not found");

    const dish = await Dish.findById(menuItem.dishId);
    if (!dish) throw new Error("Dish not found");

    const menu = await Menu.findOne({ items: menuItemId });
    if (!menu) throw new Error("Menu not found for this item");

    const restaurant = await Restaurant.findById(menu.restaurantId);
    if (!restaurant) throw new Error("Restaurant not found");

    const title = "Tvoje jelo je dostupno! 🍲";
    const body = `${dish.name} je sada dostupan u restoranu ${restaurant.name} (od ${availableFrom}).`;

    const imageUrl = dish.imageUrl || "";

    const message = {
      webpush: {
        notification: {
          title: title,
          body: body,
          icon: imageUrl || "/logoWhite.png", // Dish image as icon!
          badge: "/logoWhite.png",
          image: imageUrl, // Large image in notification
        },
        data: {
          dishId: (dish as any)._id.toString(),
          restaurantId: (restaurant as any)._id.toString(),
          menuItemId: menuItemId,
          availableFrom: availableFrom,
          url: `/student/restaurants/${(restaurant as any)._id.toString()}`,
        },
        fcmOptions: {
          link: `/student/restaurants/${(restaurant as any)._id.toString()}`,
        },
      },
      data: {
        title: title, // Passing title/body in data for SW backup
        body: body,
        dishId: (dish as any)._id.toString(),
        restaurantId: (restaurant as any)._id.toString(),
        menuItemId: menuItemId,
        availableFrom: availableFrom,
        url: `/student/restaurants/${(restaurant as any)._id.toString()}`,
      },
      topic: `dish_notify_${(dish as any)._id.toString()}_${(restaurant as any)._id.toString()}`,
    };

    const response = await messaging.send(message);
    console.log("Successfully sent message:", response);

    // Find all subscribers (by dishId AND restaurantId)
    const subscribers = await Subscription.find({
      dishId: (dish as any)._id,
      restaurantId: (restaurant as any)._id,
    });

    // Save to database for each subscribed student
    const notificationPromises = subscribers.map((sub) =>
      Notification.create({
        title: title,
        description: body,
        imageUrl: imageUrl,
        type: "student",
        postedBy: userId,
        targetUserId: sub.userId,
        restaurantId: (restaurant as any)._id.toString(),
        dishId: (dish as any)._id.toString(),
      }),
    );
    await Promise.all(notificationPromises);

    return { success: true, response };
  } catch (error: any) {
    console.error("Error sending message:", error);
    return { success: false, error: error.message || JSON.stringify(error) };
  }
}

export async function sendPollNotifications(params: {
  pollId: string;
  pollTitle: string;
  targetUserIds: string[];
  restaurantName: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await dbConnect();

  try {
    const title = "Nova anketa dostupna! 📊";
    const body = `Imamo nekoliko pitanja o hrani u restoranu ${params.restaurantName}: "${params.pollTitle}"`;
    const pollLink = `/student/polls/${params.pollId}`;

    const messages = params.targetUserIds.map((targetUserId) => ({
      topic: `user_${targetUserId}`,
      notification: {
        title,
        body,
      },
      data: {
        type: "poll",
        pollId: params.pollId,
        url: pollLink,
      },
      webpush: {
        fcmOptions: {
          link: pollLink,
        },
      },
    }));
    const response = await messaging.sendEach(messages);
    console.log(
      `Successfully sent ${response.successCount} poll notifications.`,
    );

    return { success: true, count: response.successCount };
  } catch (error: any) {
    console.error("Error sending poll notifications:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteNotification(notificationId: string) {
  await dbConnect();
  try {
    await Notification.findByIdAndDelete(notificationId);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function subscribeTokenToTopic(token: string, topic: string) {
  try {
    await messaging.subscribeToTopic(token, topic);
    return { success: true };
  } catch (error: any) {
    console.error("FCM Topic Subscription Error:", error);
    return { success: false, error: error.message };
  }
}

export async function unsubscribeTokenFromTopic(token: string, topic: string) {
  try {
    await messaging.unsubscribeFromTopic(token, topic);
    return { success: true };
  } catch (error: any) {
    console.error("FCM Topic Unsubscription Error:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleSubscription(
  dishId: string,
  restaurantId: string,
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await dbConnect();

  const existing = await Subscription.findOne({
    userId,
    dishId,
    restaurantId,
  });
  if (existing) {
    await Subscription.findByIdAndDelete(existing._id);
    return { success: true, subscribed: false };
  } else {
    await Subscription.create({ userId, dishId, restaurantId });
    return { success: true, subscribed: true };
  }
}

export async function getUserSubscriptions(restaurantId?: string) {
  const { userId } = await auth();
  if (!userId) return [];

  await dbConnect();
  const query: any = { userId };
  if (restaurantId) {
    query.restaurantId = restaurantId;
  }
  const subs = await Subscription.find(query);
  return subs.map((sub) => sub.dishId.toString());
}

export async function syncDeviceSubscriptions(token: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await dbConnect();

  try {
    const subs = await Subscription.find({ userId });

    // Subscribe token to all topics the user has in DB
    const syncPromises = subs.map((sub) =>
      messaging.subscribeToTopic(
        token,
        `dish_notify_${sub.dishId}_${sub.restaurantId}`,
      ),
    );

    // Also subscribe to general public announcements
    syncPromises.push(messaging.subscribeToTopic(token, "topic_all_students"));

    // Subscribe to a personal topic for targeted notifications (like polls)
    syncPromises.push(messaging.subscribeToTopic(token, `user_${userId}`));

    await Promise.all(syncPromises);
    return { success: true, count: subs.length };
  } catch (error: any) {
    console.error("Device sync error:", error);
    return { success: false, error: error.message };
  }
}

export async function markNotificationAsRead(notificationId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  await dbConnect();

  try {
    const notif = await Notification.findById(notificationId);
    if (!notif) return { success: false, error: "Notification not found" };

    if (notif.targetUserId && notif.targetUserId === userId) {
      // Personal notification
      await Notification.findByIdAndUpdate(notificationId, { read: true });
    } else {
      // Broadcast or worker notification - create receipt
      await ReadReceipt.create({ userId, notificationId });
    }

    return { success: true };
  } catch (error: any) {
    // Duplicate key error means already read, which is fine
    if (error.code === 11000) return { success: true };
    return { success: false, error: error.message };
  }
}

export async function markAllNotificationsAsRead() {
  const { userId, sessionClaims } = await auth();
  if (!userId) throw new Error("Unauthorized");
  await dbConnect();

  try {
    // 1. Mark personal notifications as read
    await Notification.updateMany(
      { targetUserId: userId, read: false },
      { read: true },
    );

    const role = sessionClaims?.metadata?.role || "student";


    const typeFilter =
      role === "worker" || role === "manager" ? "worker" : "student";

    const query = {
      $or: [{ targetUserId: { $exists: false } }, { targetUserId: null }],
    };

    const allBroadcasts = await Notification.find(query).select("_id").lean();

    const receipts = allBroadcasts.map((n) => ({
      userId,
      notificationId: n._id,
    }));

    if (receipts.length > 0) {
      try {
        await ReadReceipt.insertMany(receipts, { ordered: false });
      } catch (e) {
        // Ignore duplicate errors
      }
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getUnreadNotificationCount() {
  const { userId, sessionClaims } = await auth();
  if (!userId) return 0;
  await dbConnect();

  try {
    const personalCount = await Notification.countDocuments({
      targetUserId: userId,
      read: false,
    });

    const role = sessionClaims?.metadata?.role;

    const type = role === "worker" || role === "manager" ? "worker" : "student";

    const broadcastQuery = {
      type: type,
      $or: [{ targetUserId: { $exists: false } }, { targetUserId: null }],
    };

    const totalBroadcasts = await Notification.countDocuments(broadcastQuery);


    const allBroadcasts = await Notification.find(broadcastQuery)
      .select("_id")
      .lean();
    const broadcastIds = allBroadcasts.map((b) => b._id.toString());

    const readCount = await ReadReceipt.countDocuments({
      userId,
      notificationId: { $in: broadcastIds },
    });

    return personalCount + (allBroadcasts.length - readCount);
  } catch (error) {
    console.error("Failed to count unread notifications", error);
    return 0;
  }
}

export async function deleteAllNotifications() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  await dbConnect();

  try {
    await Notification.deleteMany({ targetUserId: userId });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
