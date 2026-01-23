import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import LoginForm from "./LoginForm";

export default async function Page() {
  const { userId, sessionClaims } = await auth();

  // If user is already logged in, check their role
  if (userId) {
    const role = sessionClaims?.metadata?.role as string | undefined;

    // If they have an employee role, redirect them to the auth distributor
    // The auth distributor will handle sending them to the correct dashboard
    if (role === "admin" || role === "manager" || role === "worker") {
      redirect("/auth/redirect");
    }

    // If they are a student (role === undefined or "student"), we still might want to redirect them
    // But typically students log in via different route.
    // If a student accidentally comes here and is logged in, redirect them too.
    redirect("/auth/redirect");
  }

  return <LoginForm />;
}
