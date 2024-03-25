import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import * as jose from 'jose';
import Page from '@/constants/Page';
import getPayloadFromJWT from '@/utils/getPayloadFromJWT';

export async function middleware(req) {
  const cookie = cookies().get('authorization')?.value;

  if (!cookie) {
    if (req.nextUrl.pathname === Page.LOGIN) return NextResponse.next();
    return NextResponse.redirect(new URL(Page.LOGIN, req.url));
  }

  try {
    const payload = await getPayloadFromJWT(cookie);
    console.log(payload);

    // If the user is trying to access the login page with a valid cookie, redirect to /myaccount
    if (req.nextUrl.pathname === Page.LOGIN) {
      return NextResponse.redirect(new URL(Page.DASHBOARD, req.url));
    }

    return NextResponse.next();
  } catch (error) {
    // If the user is already on the login page with an invalid cookie, do nothing to avoid redirect loops
    if (req.nextUrl.pathname === Page.LOGIN) return NextResponse.next();

    return NextResponse.redirect(new URL(Page.LOGIN, req.url));
  }
}

export const config = {
  matcher: ['/myaccount/:path*', '/login'],
};
