import { cookies } from 'next/headers';

import * as jose from 'jose';

import prisma from '@/lib/db';

export async function GET() {
  const cookie = cookies().get('authorization');

  if (!cookie) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const jwtValue = cookie?.value;
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    const { uuid } = jose.decodeJwt(jwtValue, secret);

    if (!uuid) {
      return new Response('Unauthorized', { status: 401 });
    }

    let user = await prisma.users.findFirst({
      where: {
        uuid: uuid,
      },
    });

    if (user) {
      user.created_at = Math.floor(new Date(user.created_at).getTime() / 1000);
      user.updated_at = Math.floor(new Date(user.updated_at).getTime() / 1000);
    } else {
      cookies().delete('authorization');
      return new Response('User not found', { status: 404 });
    }

    return new Response(JSON.stringify(user), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response('Unauthorized', { status: 401 });
  }
}
