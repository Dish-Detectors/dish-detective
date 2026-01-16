"use server";
import { auth } from "@clerk/nextjs/server";
import Notification from "@/models/Notification";
import DishRating, { IDishRating } from "@/models/DishRating";
import dbConnect from "@/utils/dbConnect";

type ActionResponse = {
  success: boolean;
  message: string;
  data?: any;
  errors?: Record<string, string>;
};

export async function addNotification(
  description: string,
  type: "worker" | "student",
): Promise<ActionResponse> {
  const conn = await dbConnect();
  const { userId } = await auth();

  if (!userId) {
    return {
      success: false,
      message: "User not authenticated",
      errors: { image: "User not authenticated" },
    };
  }

  const NotificationModel = conn.model("Notification", Notification.schema);

  const newNotification = new NotificationModel({
    description,
    type,
    postedBy: userId,
    createdAt: new Date(),
  });

  await newNotification.save();
  return {
    success: true,
    message: "Success",
  };
}

export async function deleteNotification(
  notificationId: string,
): Promise<ActionResponse> {
  await dbConnect();
  const { userId } = await auth();

  if (!userId) {
    return {
      success: false,
      message: "User not authenticated",
      errors: { image: "User not authenticated" },
    };
  }
  const deletedNotif = await Notification.findByIdAndDelete(notificationId);
  if (!deletedNotif) {
    return {
      success: false,
      message: "Notification not found",
    };
  }
  return {
    success: true,
    message: "Success",
  };
}


export async function getDishSubscriptionStats(params: {
  dishIds: string[];
  menzaId?: string;
}): Promise<Record<string, number>> {
  void params;

  // Placeholder so UI can render
  await dbConnect();

  const result: Record<string, number> = {};
  for (const dishId of params.dishIds) {
    result[dishId] = 0;
  }

  return result;
}

export async function getAllRatingsForDish(
  dishId: string,
): Promise<IDishRating[]> {
  try {
    await dbConnect();

    const ratings = await DishRating.find({ dishId });
    if (!ratings) {
      return [];
    }
    return ratings;
  } catch (error: any) {
    console.error("Error fetching ratings:", error);

    return [];
  }
}