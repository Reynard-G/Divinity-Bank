import { cookies } from 'next/headers';

import { users } from '@/drizzle/schema';
import { db } from '@/lib/db';
import getPayloadFromJWT from '@/utils/getPayloadFromJWT';

export const preferredRegion = ['sfo1'];
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const excludeSelf =
      url.searchParams.has('excludeSelf') ||
      url.searchParams.get('excludeSelf') === 'true';

    let allUsers = await db
      .select({
        id: users.id,
        discord_username: users.discordUsername,
        minecraft_uuid: users.minecraftUuid,
        minecraft_username: users.minecraftUsername,
      })
      .from(users);

    if (excludeSelf) {
      const cookie = cookies().get('authorization')?.value;
      const userId = (await getPayloadFromJWT(cookie))?.id;

      allUsers = allUsers.filter((user) => user.id !== userId);
    }

    return new Response(JSON.stringify(allUsers), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
    });
  }
}
