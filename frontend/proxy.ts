import { NextResponse, type NextRequest } from "next/server";

const TOKEN_COOKIE = "kodigo_token";
const protectedPrefixes = ["/checkout", "/account"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));

  if (isProtected) {
    const hasToken = request.cookies.has(TOKEN_COOKIE);
    if (!hasToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/checkout/:path*", "/account/:path*"],
};
