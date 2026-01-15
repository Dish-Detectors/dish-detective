import { redirect } from "next/navigation";
import { auth, clerkClient } from "@clerk/nextjs/server";
import dbConnect from "@/utils/dbConnect";
import User from "@/models/User";

export default async function RedirectAfterSignIn() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  await dbConnect();

  let user;

  try {
    // Find or create user with atomic upsert
    const foundOrCreatedUser = await User.findOneAndUpdate(
      { clerkId: userId },
      {
        $setOnInsert: {
          clerkId: userId,
          role: "student",
          restaurantId: undefined, // Explicitly set to undefined for students
        },
      },
      { upsert: true, new: true, runValidators: false }, // Disable validators on upsert
    ).lean();

    console.log("User found/created:", user);

    const client = await clerkClient();

    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: foundOrCreatedUser.role,
      },
    });

    user = foundOrCreatedUser;
  } catch (error) {
    console.error("Error in auth redirect:", error);
    // If there's an error, redirect to home page
    redirect("/");
  }

  switch (user.role) {
    case "admin":
      redirect("/admin");
    case "manager":
      redirect("/manager");
    case "worker":
      redirect("/worker");
    case "student":
    default:
      redirect("/student");
  }
}
