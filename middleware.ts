import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken, SESSION_COOKIE } from "@/lib/auth";

const ADMIN_PATHS = ["/admin"];
const AUTH_PATHS = ["/profile", "/orders"];
const PUBLIC_ADMIN_PATHS = ["/admin/login"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE)?.value;

  const isAdminPath = ADMIN_PATHS.some((p) => pathname.startsWith(p));
  const isPublicAdminPath = PUBLIC_ADMIN_PATHS.some((p) =>
    pathname.startsWith(p)
  );
  const isAuthPath = AUTH_PATHS.some((p) => pathname.startsWith(p));

  // Inject pathname for layout detection
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);

  // Allow public admin paths (login page)
  if (isPublicAdminPath) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Protect admin routes
  if (isAdminPath) {
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    const session = await verifyToken(token);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Protect user routes (soft redirect)
  if (isAuthPath) {
    if (!token) {
      return NextResponse.redirect(
        new URL(`/login?redirect=${encodeURIComponent(pathname)}`, req.url)
      );
    }
    const session = await verifyToken(token);
    if (!session) {
      return NextResponse.redirect(
        new URL(`/login?redirect=${encodeURIComponent(pathname)}`, req.url)
      );
    }
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/profile/:path*",
    "/orders/:path*",
  ],
};
