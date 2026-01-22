import { redirect } from "next/navigation";
import { auth, clerkClient } from "@clerk/nextjs/server";

export default async function RedirectAfterSignIn() {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect("/");
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  let role = user.publicMetadata?.role as string | undefined;

  // If role is not set, default to student and update Clerk metadata
  if (!role) {
    try {
      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          role: "student",
        },
      });
      role = "student";
    } catch (error) {
      console.error("Error setting default role in Clerk:", error);
      // Fallback to student even if Clerk update fails
      role = "student";
    }
  }

  switch (role) {
    case "admin":
      redirect("/admin");
    case "manager":
      redirect("/manager");
    case "worker":
      redirect("/worker");
    case "student":
    default:
      redirect("/student/restaurants");
  }
}
