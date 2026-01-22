import { redirect } from "next/navigation";
import { auth, clerkClient } from "@clerk/nextjs/server";

export default async function RedirectAfterSignIn() {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect("/");
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  let role = user.publicMetadata?.role as string | null | undefined;
  const restaurantId = user.publicMetadata?.restaurantId as
    | string
    | null
    | undefined;

  // Check for explicitly unassigned employee
  if (role === null && restaurantId === null) {
    redirect("/unassigned");
  }

  // If role is missing (undefined), default to student
  if (role === undefined) {
    try {
      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          role: "student",
        },
      });
      role = "student";
    } catch (error) {
      console.error("Error setting default role in Clerk:", error);
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
