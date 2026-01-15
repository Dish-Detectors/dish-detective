import { ReactNode } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function WorkerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    redirect("/");
  }

  if (sessionClaims?.metadata?.role !== "worker") {
    redirect("/");
  }

  return <>{children}</>;
}
