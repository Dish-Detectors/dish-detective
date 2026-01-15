import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/login/student(.*)",
  "/login/employee(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/auth/redirect",
  "/auth/sso-callback(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isWorkerRoute = createRouteMatcher(["/worker(.*)"]);
const isManagerRoute = createRouteMatcher(["/manager(.*)"]);
const isStudentRoute = createRouteMatcher(["/student(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) {
    return;
  }

  const { userId, sessionClaims } = await auth();

  // If not logged in and not a public route, protect it
  if (!userId) {
    await auth.protect();
    return;
  }

  const role = (sessionClaims as any)?.metadata?.role || "student";

  // Define which roles can access which paths
  const rolePaths: Record<string, string> = {
    admin: "/admin",
    worker: "/worker",
    manager: "/manager",
    student: "/student",
  };

  const currentRolePath = rolePaths[role] || "/student";

  // If user is on a dashboard route that doesn't match their role, redirect them
  if (
    (isAdminRoute(req) && role !== "admin") ||
    (isWorkerRoute(req) && role !== "worker") ||
    (isManagerRoute(req) && role !== "manager") ||
    (isStudentRoute(req) && role !== "student")
  ) {
    return NextResponse.redirect(new URL(currentRolePath, req.url));
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
