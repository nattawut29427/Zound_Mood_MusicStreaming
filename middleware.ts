import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const user = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  
  const publicPaths = ["/signin", "/register"];

  // exclude API ของ next-auth ออก
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const isPublic = publicPaths.some((path) => pathname.startsWith(path));

  if (!isPublic && !user) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
