import { cookies } from 'next/headers';

import { decodeJwt } from 'jose';

import prisma from '@/lib/db';

export async function GET() {
  const cookie = cookies().get('authorization');

  if (!cookie) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const jwtValue = cookie.value;
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    const { id } = decodeJwt(jwtValue, secret);

    if (!id) {
      cookies().delete('authorization');
      return new Response('Unauthorized', { status: 401 });
    }

    const user = await prisma.users.findFirst({
      where: { id },
      select: {
        id: true,
        discord_username: true,
        minecraft_uuid: true,
        minecraft_username: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      cookies().delete('authorization');
      return new Response('User not found', { status: 404 });
    }

    const formattedUser = {
      ...user,
      created_at: Math.floor(new Date(user.created_at).getTime() / 1000),
      updated_at: Math.floor(new Date(user.updated_at).getTime() / 1000),
    };

    return new Response(JSON.stringify(formattedUser), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response('Unauthorized', { status: 401 });
  }
}
