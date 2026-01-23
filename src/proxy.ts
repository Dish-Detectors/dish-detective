import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const LANG_COOKIE = "dd_lang";

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

async function handleRedirects(
  isEmployeeSubdomain: boolean,
  url: URL,
): Promise<NextResponse | null> {
  // If on employee subdomain and trying to go to root or student login, redirect to employee login
  if (isEmployeeSubdomain) {
    if (
      url.pathname === "/" ||
      url.pathname.startsWith("/login/student") ||
      url.pathname.startsWith("/sign-in")
    ) {
      url.pathname = "/login/employee";
      return NextResponse.redirect(url);
    }
  }

  // If on main domain and trying to go to employee login, redirect to student login
  if (!isEmployeeSubdomain && url.pathname.startsWith("/login/employee")) {
    url.pathname = "/login/student";
    return NextResponse.redirect(url);
  }

  return null;
}

export default clerkMiddleware(async (auth, req) => {
  const host = req.headers.get("host") || "";
  const langHeader = req.headers.get("accept-language") || "";
  const detectedLang = langHeader.toLowerCase().startsWith("hr") ? "HR" : "EN";
  const existingLang = req.cookies.get(LANG_COOKIE)?.value;
  const langToSet =
    existingLang === "HR" || existingLang === "EN" ? null : detectedLang;

  const isEmployeeSubdomain = host.startsWith("employee.");
  const url = req.nextUrl.clone();

  const response = await handleRedirects(isEmployeeSubdomain, url);
  if (response) {
    // Also set the language cookie on redirect (only if missing)
    if (langToSet) response.cookies.set(LANG_COOKIE, langToSet, { path: "/" });
    return response;
  }

  if (isPublicRoute(req)) {
    const res = NextResponse.next();
    if (langToSet) res.cookies.set(LANG_COOKIE, langToSet, { path: "/" });
    return res;
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

  // Normal pass-through; still ensure language cookie exists.
  const res = NextResponse.next();
  if (langToSet) res.cookies.set(LANG_COOKIE, langToSet, { path: "/" });
  return res;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
