import { NextRequest, NextResponse } from "next/server";
import { getSession, updateSession } from "@/lib/auth/jwt";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;
  const session = await getSession();

  if (pathname.startsWith("/login") && session) {
    return NextResponse.redirect(new URL("/app", request.url));
  }

  if (pathname.startsWith("/app")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    
    await updateSession(session);
    
    const serverMatch = pathname.match(/^\/app\/server\/([^\/]+)(\/|$)/); // Match /app/server/:server or /app/server/:server/
    if (serverMatch) {
      response.cookies.set('lastVisitedServer', serverMatch[1], {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });
    }

    return response;
  }

  /*if (pathname.startsWith("/panel")) {
    if (!session || !["ADMIN", "BANKER"].includes(session.role)) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }*/

  return response;
}

export const config = {
  matcher: [
    "/app/:path*",
    "/panel/:path*",
    "/login/:path*",
  ],
};
