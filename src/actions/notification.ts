"use server";
import { clerkClient } from "@clerk/nextjs/server";
import Notification, { INotification } from "@/models/Notification";
import dbConnect from "@/utils/dbConnect";


export async function getAllWorkerNotifications(): Promise<INotification[]> {
    await dbConnect();
  
    const notifications = await Notification.find({ type: "worker" }).sort({ createdAt: -1 });
    if (!notifications) {
        return [];
        }
    const client = await clerkClient();
    notifications.map(async (notif) => {
      const user = await client.users.getUser(notif.postedBy);
      notif.postedBy = `${user.firstName || "Nepoznato ime"} ${user.lastName || "Nepoznato prezime"}`;
      return notif;
    });
  
    return notifications;
  }
  
  export async function getAllStudentNotifications(): Promise<INotification[]> {
    await dbConnect();
  
    const notifications = await Notification.find({ type: "student" }).sort({ createdAt: -1 });
    if (!notifications) {
        return [];
        }
    const client = await clerkClient();
    notifications.map(async (notif) => {
      const user = await client.users.getUser(notif.postedBy);
      notif.postedBy = `${user.firstName || "Nepoznato ime"} ${user.lastName || "Nepoznato prezime"}`;
      return notif;
    });
  
    return notifications;
  }