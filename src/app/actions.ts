"use server";

import { auth } from "@clerk/nextjs/server";

export async function getUserRole() {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return { role: null, error: "Unauthorized" };
    }

    const role = (sessionClaims as any)?.metadata?.role || "student";

    return { role, error: null };
  } catch (error) {
    console.error("Error fetching user role:", error);
    return { role: null, error: "Failed to fetch user role" };
  }
}
