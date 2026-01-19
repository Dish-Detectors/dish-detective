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
      // Determine read status:
      // If broadcast (no targetUserId), check receipt.
      // If personal (targetUserId exists), check notif.read (though personal worker notifs might not exist yet, logic stands)
      // Actually worker notifications are currently ALL broadcasts (type defined by sender usually, but here 'worker' type is generic).
      // Assuming 'worker' type notifications are broadcasts to all workers.
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
      // Logic:
      // If it's MY personal notification, use the 'read' field on the doc.
      // If it's a broadcast (targetUserId is null/missing), use ReadReceipt.
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

    // Also subscribe to general public announcements
    // In a real app we might check role, but for now we subscribe everyone to students topic
    // or distinct topics based on their role if available.
    // The requirement says "student" notifications go to push.
    syncPromises.push(messaging.subscribeToTopic(token, "topic_all_students"));

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

    // 2. Mark all relevant broadcasts as read
    // Find all broadcasts this user CAN see (student or worker)
    const role = sessionClaims?.metadata?.role || "student";
    // If worker/manager, they see worker type? Or student?
    // Let's assume standard logic:
    // If getting student notifs -> mark student broadcasts
    // If getting worker notifs -> mark worker broadcasts
    // Actually, safer to just find ALL unread broadcasts for this user context?
    // Let's match the fetch logic.

    // We'll mark 'student' broadcasts if user is student, and 'worker' if worker.
    // Simplifying: Just find all broadcasts of relevant types that don't have a receipt yet.
    // This is complex to query efficiently ("find not in other collection").

    // Alternative: Client calls this. We can just insert receipts for ALL broadcasts currently visible?
    // Or just fetch IDs of unread broadcasts and insert.

    const typeFilter =
      role === "worker" || role === "manager" ? "worker" : "student";
    // Wait, managers might want student notifs too?
    // Let's rely on what getAllStudentNotifications fetches.
    // Currently users usually act as one role.

    // Let's Fetch all broadcasts relevant to user
    const query = {
      $or: [{ targetUserId: { $exists: false } }, { targetUserId: null }],
      // If we want to be strict about type, we need to know context.
      // But usually marking *all* as read implies all visible.
      // Let's just find ALL broadcasts.
    };

    const allBroadcasts = await Notification.find(query).select("_id").lean();

    // Insert receipts for all of them. Use ordered: false to ignore duplicates.
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
    // 1. Personal unread
    const personalCount = await Notification.countDocuments({
      targetUserId: userId,
      read: false,
    });

    // 2. Broadcast unread
    // Count total broadcasts meant for this user
    // Subtract count of read receipts

    // Determine type context. This is tricky without passing argument.
    // But usually simple users are students. Workers are workers.
    const role = sessionClaims?.metadata?.role;

    // If worker/manager, check 'worker' type broadcasts.
    // If student (or undefined role), check 'student' type.
    const type = role === "worker" || role === "manager" ? "worker" : "student";
    // NOTE: This assumes a user only checks ONE stream.

    const broadcastQuery = {
      type: type,
      $or: [{ targetUserId: { $exists: false } }, { targetUserId: null }],
    };

    const totalBroadcasts = await Notification.countDocuments(broadcastQuery);

    // Count receipts for this user that correspond to these broadcasts
    // (We count receipts where notificationId is in the set of broadcast IDs?
    //  Or just count all receipts for this user and assume they match?
    //  Safest: Count receipts for notifications of this type.)

    // Optimize: Get IDs of broadcasts? No, too many?
    // Actually, `ReadReceipt.countDocuments({ userId })` counts ALL receipts.
    // If user has receipts for old notifications that are deleted? Or different type?

    // Let's count receipts where notificationId refers to a notification of correct type.
    // This requires aggregation/lookup.

    // For MVP/Speed: Just count all receipts for user?
    // Risk: If user switches roles or there are other types.

    // Better: Fetch all broadcast IDs (usually not THAT many active ones? history is 50 limit in UI but DB has more).
    // Let's stick to recent history? Notification Center usually loads all? No action loads 50?
    // getAllStudentNotifications logic used `find` without limit (actually bad for scale!).

    // Let's mirror `getAllStudentNotifications` logic but just count.

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
