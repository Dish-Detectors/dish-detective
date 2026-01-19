import { ReactNode } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import StudentLayoutClient from "@/components/StudentLayoutClient";

export default async function StudentLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect("/");
  }

  // Students are the default role, but we still check if they are not something else
  // or if they have the student role explicitly
  const role = sessionClaims?.metadata?.role;
  if (role && role !== "student") {
    // If they have a different role, redirect them to their respective dashboard
    redirect(`/${role}`);
  }

  return <StudentLayoutClient>{children}</StudentLayoutClient>;
}
