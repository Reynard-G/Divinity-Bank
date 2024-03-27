import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';
import Page from '@/constants/Page';
import getPayloadFromJWT from '@/utils/getPayloadFromJWT';

const ratelimit = new Ratelimit({
  redis: kv,
  // 5 requests from the same IP in 5 seconds
  limiter: Ratelimit.slidingWindow(5, '5 s'),
});

export async function middleware(req) {
  const ip = req.ip ?? '127.0.0.1';
  const { remaining } = await ratelimit.limit(ip);

  // If rate limit is reached, redirect to /blocked page
  if (remaining <= 0) {
    return NextResponse.redirect(new URL(Page.BLOCKED, req.url));
  }

  const cookie = cookies().get('authorization')?.value;
  try {
    const payload = await getPayloadFromJWT(cookie);
    console.log(payload);

    if (!payload) throw new Error('Unauthorized');

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
  matcher: ['/myaccount/:path*', '/api/:path*', '/login'],
};
