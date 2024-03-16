import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import * as jose from 'jose'
import Pages from '@/constants/Pages';

export async function middleware(req) {
  const cookie = cookies().get('authorization');
  const token = cookie?.value;

  if (!token) {
    if (req.nextUrl.pathname === Pages.LOGIN) return NextResponse.next();
    return NextResponse.redirect(new URL(Pages.LOGIN, req.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    console.log(payload);

    // If the user is trying to access the login page with a valid token, redirect to /myaccount
    if (req.nextUrl.pathname === Pages.LOGIN) {
      return NextResponse.redirect(new URL(Pages.DASHBOARD, req.url));
    }

    return NextResponse.next();
  } catch (error) {
    // If the user is already on the login page with an invalid token, do nothing to avoid redirect loops
    if (req.nextUrl.pathname === Pages.LOGIN) return NextResponse.next();

    return NextResponse.redirect(new URL(Pages.LOGIN, req.url));
  }
}

export const config = {
  matcher: [
    '/myaccount/:path*',
    '/login',
  ],
};
