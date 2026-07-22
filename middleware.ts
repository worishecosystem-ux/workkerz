import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const ua = req.headers.get("user-agent") || "";
  const isApp = ua.includes("WorkkerzApp");

  const { pathname } = req.nextUrl;

  // Always allow these routes
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/coming-soon") ||
    pathname.startsWith("/privacy-policy") ||
    pathname.startsWith("/delete-account") || // ✅ Allow Delete Account page
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/sitemap.xml") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Browser users -> Only Home page
  if (
    process.env.NODE_ENV === "production" &&
    !isApp &&
    pathname === "/"
  ) {
    return NextResponse.rewrite(new URL("/coming-soon", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};