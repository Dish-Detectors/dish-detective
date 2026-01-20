"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";

export async function uploadProfileImage(formData: FormData) {
  try {
    const { userId, sessionClaims } = await auth();
    if (!userId || sessionClaims?.metadata?.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    const file = formData.get("file") as File;
    const targetUserId = formData.get("userId") as string;

    if (!file || !targetUserId) {
      return { success: false, error: "Missing file or user ID" };
    }

    const client = await clerkClient();

    // Clerk expects a Blob or File object for the image
    // Convert File to Blob if necessary, though File extends Blob
    // The SDK method signature might require strict types

    // According to Clerk Backend API docs for `updateUserProfileImage`:
    // It accepts `file` as a Blob or File.

    await client.users.updateUserProfileImage(targetUserId, {
      file: file,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error uploading profile image:", error);
    return {
      success: false,
      error: error.message || "Failed to upload profile image",
    };
  }
}
