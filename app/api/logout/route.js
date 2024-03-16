import { cookies } from 'next/headers';

export async function POST() {
  // Remove authorization cookie
  cookies().delete('authorization');

  return new Response('Logged out successfully', { status: 200 });
};

export const runtime = 'edge';
