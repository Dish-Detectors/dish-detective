import { ReactNode } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AdminLayoutClient from "@/components/AdminLayoutClient";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    redirect("/");
  }

  if (sessionClaims?.metadata?.role !== "admin") {
    redirect("/");
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
