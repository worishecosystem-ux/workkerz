import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const ua = req.headers.get("user-agent") || "";
  const isApp = ua.includes("WorkkerzApp");
  const pathname = req.nextUrl.pathname;

  // Static files aur API ko skip karo
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Browser users -> Coming Soon page dikhaye
  if (!isApp && pathname !== "/coming-soon") {
    return NextResponse.rewrite(new URL("/coming-soon", req.url));
  }

  // App users -> Coming Soon kabhi na dikhe
  if (isApp && pathname === "/coming-soon") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};