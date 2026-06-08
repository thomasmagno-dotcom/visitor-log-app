import { NextRequest, NextResponse } from "next/server";
import { verifyToken, COOKIE } from "@/lib/session";

const PROTECTED = ["/history", "/admin"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isLoginPage = pathname === "/admin/login";

  if (!isProtected || isLoginPage) return NextResponse.next();

  const token = req.cookies.get(COOKIE)?.value ?? "";
  if (verifyToken(token)) return NextResponse.next();

  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/admin/login";
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/history/:path*", "/admin/:path*"],
};
