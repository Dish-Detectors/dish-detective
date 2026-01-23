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

  const isEmployee = user.publicMetadata?.isEmployee === true;

  // Check for explicitly unassigned employee (isEmployee=true but no role/rest)
  // Or if role is missing/null/undefined BUT they are an employee
  if (isEmployee && !role && !restaurantId) {
    redirect("/unassigned");
  }

  // If role is missing and NOT an employee -> Default to Student
  if (role === undefined && !isEmployee) {
    try {
      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          role: "student",
          isEmployee: false, // Explicitly mark as not employee
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
