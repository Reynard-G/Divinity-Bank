import { cookies } from 'next/headers';

import prisma from '@/lib/db';
import getPayloadFromJWT from '@/utils/getPayloadFromJWT';
import minecraftProfileFromUUID from '@/utils/minecraftProfileFromUUID';

export const runtime = 'edge';

export async function GET() {
  const cookie = cookies().get('authorization')?.value;

  try {
    const id = (await getPayloadFromJWT(cookie))?.id;

    const user = await prisma.users.findFirst({
      where: { id },
      select: {
        id: true,
        discord_username: true,
        minecraft_uuid: true,
        minecraft_username: true,
        created_at: true,
        updated_at: true,
        AccountTypes: {
          select: {
            name: true,
            interest_rate: true,
            transaction_fee: true,
          },
        },
      },
    });

    if (!user) return new Response('User not found', { status: 404 });

    // Convert UTC Datetime to Unix Timestamp
    const formattedUser = {
      ...user,
      account_type: user.AccountTypes.name,
      interest_rate: user.AccountTypes.interest_rate,
      transaction_fee: user.AccountTypes.transaction_fee,
      created_at: Math.floor(new Date(user.created_at).getTime() / 1000),
      updated_at: Math.floor(new Date(user.updated_at).getTime() / 1000),
    };
    delete formattedUser.AccountTypes;

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
