import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "insecure-dev-secret"
);

const publicPaths = ["/", "/login", "/register"];
const authPaths = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip essential system paths to avoid recursion for the status API and block static assets
  if (
    pathname.startsWith("/api/system/maintenance") ||
    pathname.includes("_next") ||
    pathname.includes("favicon.ico") ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  // 2. Determine Maintenance State
  let maintenanceMode = false;
  try {
    const maintenanceRes = await fetch(new URL("/api/system/maintenance", request.url), {
      cache: "no-store",
    });
    const status = await maintenanceRes.json();
    maintenanceMode = status.maintenanceMode;
  } catch (e) {
    // If check fails, allow access to avoid lockout
  }

  // 3. Authentication & Role Retrieval
  const token = request.cookies.get("sevasetu_token")?.value;
  let userRole = "";
  let isVerified = false;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      userRole = payload.role as string;
      isVerified = payload.isVerified as boolean;
    } catch (e) {
      // Invalid token, clear and proceed as guest
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("sevasetu_token");
      return response;
    }
  }

  // 4. Enforce Maintenance Mode
  const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";
  if (maintenanceMode && !isAdmin) {
    if (pathname !== "/maintenance") {
      return NextResponse.redirect(new URL("/maintenance", request.url));
    }
    return NextResponse.next();
  }

  // 5. Autoredirect AWAY from maintenance page if it's turned off
  if (!maintenanceMode && pathname === "/maintenance") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 6. Handle Auth redirection for Guest/Public paths
  if (publicPaths.includes(pathname)) {
    if (token && userRole) {
      return NextResponse.redirect(new URL(getDashboardPath(userRole), request.url));
    }
    return NextResponse.next();
  }

  // 6. Enforce Auth for all other paths
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 7. Verification Check
  if (!isVerified && !pathname.startsWith("/verify")) {
    return NextResponse.redirect(new URL("/verify", request.url));
  }

  // 8. Role-Based Access Control (RBAC)
  if (pathname.startsWith("/admin") && !isAdmin) {
    return NextResponse.redirect(new URL(getDashboardPath(userRole), request.url));
  }
  if (pathname.startsWith("/dept-head") && userRole !== "DEPT_HEAD") {
    return NextResponse.redirect(new URL(getDashboardPath(userRole), request.url));
  }
  if (pathname.startsWith("/officer") && userRole !== "OFFICER") {
    return NextResponse.redirect(new URL(getDashboardPath(userRole), request.url));
  }
  if (pathname.startsWith("/citizen") && userRole !== "CITIZEN") {
    return NextResponse.redirect(new URL(getDashboardPath(userRole), request.url));
  }

  return NextResponse.next();
}

function getDashboardPath(role: string): string {
  switch (role) {
    case "SUPER_ADMIN":
    case "ADMIN":
      return "/admin/dashboard";
    case "DEPT_HEAD":
      return "/dept-head/dashboard";
    case "OFFICER":
      return "/officer/dashboard";
    case "CITIZEN":
    default:
      return "/citizen/dashboard";
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled separately)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)",
  ],
};
