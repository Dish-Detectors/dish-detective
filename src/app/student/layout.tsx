import { ReactNode } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import dbConnect from "@/utils/dbConnect";
import User from "@/models/User";
import StudentLayoutClient from "@/components/StudentLayoutClient";

export default async function StudentLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  await dbConnect();

  // Find or create user (in case they bypass /auth/redirect)
  const user = await User.findOneAndUpdate(
    { clerkId: userId },
    {
      $setOnInsert: {
        clerkId: userId,
        role: "student",
      },
    },
    { upsert: true, new: true, runValidators: false },
  ).lean();

  if (!user || user.role !== "student") {
    redirect("/");
  }

  return <StudentLayoutClient>{children}</StudentLayoutClient>;
}
