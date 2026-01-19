"use server";
import { clerkClient, auth } from "@clerk/nextjs/server";
import Notification, { INotification } from "@/models/Notification";
import Subscription from "@/models/Subscription";
import dbConnect from "@/utils/dbConnect";
import { messaging } from "@/utils/firebase";
import Menu, { MenuItem } from "@/models/Menu";
import Dish from "@/models/Dish";
import Restaurant from "@/models/Restaurant";

export async function getAllWorkerNotifications(): Promise<any[]> {
  await dbConnect();

  const notifications = await Notification.find({ type: "worker" })
    .sort({ createdAt: -1 })
    .lean();
  if (!notifications) {
    return [];
  }
  const client = await clerkClient();

  const populatedNotifications = await Promise.all(
    notifications.map(async (notif) => {
      try {
        const user = await client.users.getUser(notif.postedBy);
        return {
          ...JSON.parse(JSON.stringify(notif)),
          postedBy: `${user.firstName || "Nepoznato ime"} ${user.lastName || "Nepoznato prezime"}`,
        };
      } catch (e) {
        return JSON.parse(JSON.stringify(notif));
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
    targetUserId: userId,
  })
    .sort({ createdAt: -1 })
    .lean();
  if (!notifications) {
    return [];
  }
  const client = await clerkClient();

  const populatedNotifications = await Promise.all(
    notifications.map(async (notif) => {
      try {
        const user = await client.users.getUser(notif.postedBy);
        return {
          ...JSON.parse(JSON.stringify(notif)),
          postedBy: `${user.firstName || "Nepoznato ime"} ${user.lastName || "Nepoznato prezime"}`,
        };
      } catch (e) {
        return JSON.parse(JSON.stringify(notif));
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
      // Removing root-level notification to prevent automatic browser display
      // shifting control to either webpush or the service worker.
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
        },
      },
      data: {
        title: title, // Passing title/body in data for SW backup
        body: body,
        dishId: (dish as any)._id.toString(),
        restaurantId: (restaurant as any)._id.toString(),
        menuItemId: menuItemId,
        availableFrom: availableFrom,
      },
      topic: `dish_notify_${menuItemId}`,
    };

    const response = await messaging.send(message);
    console.log("Successfully sent message:", response);

    // Find all subscribers
    const subscribers = await Subscription.find({ menuItemId });

    // Save to database for each subscribed student
    const notificationPromises = subscribers.map((sub) =>
      Notification.create({
        title: title,
        description: body,
        imageUrl: imageUrl,
        type: "student",
        postedBy: userId,
        targetUserId: sub.userId,
      }),
    );
    await Promise.all(notificationPromises);

    return { success: true, response };
  } catch (error: any) {
    console.error("Error sending message:", error);
    return { success: false, error: error.message || JSON.stringify(error) };
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

export async function toggleSubscription(menuItemId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await dbConnect();

  const existing = await Subscription.findOne({ userId, menuItemId });
  if (existing) {
    await Subscription.findByIdAndDelete(existing._id);
    return { success: true, subscribed: false };
  } else {
    await Subscription.create({ userId, menuItemId });
    return { success: true, subscribed: true };
  }
}

export async function getUserSubscriptions() {
  const { userId } = await auth();
  if (!userId) return [];

  await dbConnect();
  const subs = await Subscription.find({ userId });
  return subs.map((sub) => sub.menuItemId.toString());
}

export async function syncDeviceSubscriptions(token: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await dbConnect();

  try {
    const subs = await Subscription.find({ userId });

    // Subscribe token to all topics the user has in DB
    const syncPromises = subs.map((sub) =>
      messaging.subscribeToTopic(token, `dish_notify_${sub.menuItemId}`),
    );

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
    await Notification.findOneAndUpdate(
      { _id: notificationId, targetUserId: userId },
      { read: true },
    );
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function markAllNotificationsAsRead() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  await dbConnect();

  try {
    await Notification.updateMany(
      { targetUserId: userId, read: false },
      { read: true },
    );
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getUnreadNotificationCount() {
  const { userId } = await auth();
  if (!userId) return 0;
  await dbConnect();

  try {
    const count = await Notification.countDocuments({
      targetUserId: userId,
      read: false,
    });
    return count;
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
