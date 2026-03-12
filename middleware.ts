import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "applyx_session";

/**
 * Lightweight auth gate that runs at the edge BEFORE any rendering starts.
 * Only checks for the session cookie — no DB call, sub-millisecond.
 * This lets the dashboard layout be fully synchronous so loading
 * skeletons render instantly.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);

  // Dashboard routes — require session cookie
  if (!hasSession) {
    const loginUrl = new URL(`/login?next=${encodeURIComponent(pathname)}`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/tracker/:path*",
    "/jobs/:path*",
    "/resumes/:path*",
    "/tailored/:path*",
    "/interviews/:path*",
    "/analytics/:path*",
    "/templates/:path*",
    "/history/:path*",
    "/settings/:path*",
    "/openclaw/:path*",
  ],
};

