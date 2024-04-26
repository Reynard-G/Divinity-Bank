import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { get } from '@vercel/edge-config';

import Page from '@/constants/Page';
import getIPFromHeaders from '@/utils/getIPFromHeaders';
import getPayloadFromJWT from '@/utils/getPayloadFromJWT';

const ratelimitCache = new Map();

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  // 10 requests from the same IP in 5 seconds
  limiter: Ratelimit.slidingWindow(10, '5 s'),
  ephemeralCache: ratelimitCache,
  timeout: 1000, // 1 second
  analytics: true,
});

export async function middleware(request) {
  const isInMaintenanceMode = await get('isInMaintenanceMode');
  if (isInMaintenanceMode) {
    return NextResponse.redirect(new URL(Page.MAINTENANCE, request.url));
  }

  const ip = getIPFromHeaders();
  const { success, pending } = await ratelimit.limit(ip);
  await pending; // Wait for analytics submission to finish

  if (!success) {
    return NextResponse.redirect(new URL(Page.BLOCKED, request.url));
  }

  const cookie = cookies().get('authorization')?.value;
  try {
    const payload = await getPayloadFromJWT(cookie);
    console.log(payload);

    if (!payload) throw new Error('Unauthorized');

    // If the user is trying to access the login page with a valid cookie, redirect to /myaccount
    if (request.nextUrl.pathname === Page.LOGIN) {
      return NextResponse.redirect(new URL(Page.DASHBOARD, request.url));
    }

    return NextResponse.next();
  } catch (error) {
    // If the user is already on the login page with an invalid cookie, do nothing to avoid redirect loops
    if (request.nextUrl.pathname === Page.LOGIN) return NextResponse.next();

    return NextResponse.redirect(new URL(Page.LOGIN, request.url));
  }
}

/**
 * The following routes are protected:
 * - /myaccount/*: Protected user subdirectory.
 * - /api/*: Getting data, not mutations.
 * - /login: Auto redirect to /myaccount if the user is already logged in.
 */
export const config = {
  matcher: ['/myaccount/:path*', '/api/:path*', '/login'],
};
