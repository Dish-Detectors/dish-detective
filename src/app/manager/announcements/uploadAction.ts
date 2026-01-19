"use server";

import { put } from "@vercel/blob";
import { auth } from "@clerk/nextjs/server";

export async function uploadAttachment(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const file = formData.get("file") as File;
  if (!file) {
    throw new Error("No file provided");
  }

  try {
    const timestamp = Date.now();
    const filename = `announcements/${timestamp}-${file.name}`;

    const blob = await put(filename, file, {
      access: "public",
    });

    // Format size to human readable
    const sizeBytes = file.size;
    let sizeString = "";
    if (sizeBytes < 1024) sizeString = sizeBytes + " B";
    else if (sizeBytes < 1024 * 1024)
      sizeString = (sizeBytes / 1024).toFixed(1) + " KB";
    else sizeString = (sizeBytes / (1024 * 1024)).toFixed(1) + " MB";

    return {
      success: true,
      attachment: {
        name: file.name,
        url: blob.url,
        type: file.type,
        size: sizeString,
      },
    };
  } catch (error: any) {
    console.error("Upload error:", error);
    return { success: false, error: error.message };
  }
}
