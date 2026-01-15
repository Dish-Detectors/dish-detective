import { ReactNode } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function ManagerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    redirect("/");
  }

  if (sessionClaims?.metadata?.role !== "manager") {
    redirect("/");
  }

  return <>{children}</>;
}
