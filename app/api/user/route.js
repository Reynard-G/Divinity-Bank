import { cookies } from 'next/headers';

import prisma from '@/lib/db';
import getPayloadFromJWT from '@/utils/getPayloadFromJWT';
import minecraftProfileFromUUID from '@/utils/minecraftProfileFromUUID';

export async function GET() {
  const cookie = cookies().get('authorization')?.value;

  if (!cookie) {
    cookies().delete('authorization');
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const id = (await getPayloadFromJWT(cookie))?.id;

    if (!id) return new Response('Unauthorized', { status: 401 });

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

    if (!user) return new Response('User not found', { status: 404 });

    const formattedUser = {
      ...user,
      created_at: Math.floor(new Date(user.created_at).getTime() / 1000),
      updated_at: Math.floor(new Date(user.updated_at).getTime() / 1000),
    };

    // Check if minecraft_username has changed
    // If it has, update the database
    const minecraftProfile = await minecraftProfileFromUUID(
      user.minecraft_uuid,
    );
    if (minecraftProfile?.name !== user.minecraft_username) {
      await prisma.users.update({
        where: { id },
        data: { minecraft_username: minecraftProfile?.name },
      });

      formattedUser.minecraft_username = minecraftProfile?.name;
    }

    return new Response(JSON.stringify(formattedUser), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response('Unauthorized', { status: 401 });
  }
}
