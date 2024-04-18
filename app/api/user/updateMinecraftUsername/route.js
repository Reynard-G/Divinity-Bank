import { cookies } from 'next/headers';

import { eq } from 'drizzle-orm';

import { users } from '@/drizzle/schema';
import { db } from '@/lib/db';
import getPayloadFromJWT from '@/utils/getPayloadFromJWT';
import minecraftProfileFromUUID from '@/utils/minecraftProfileFromUUID';

export const runtime = 'edge';
export const preferredRegion = ['sfo1'];
export const dynamic = 'force-dynamic';

export async function GET() {
  const cookie = cookies().get('authorization')?.value;

  try {
    const id = (await getPayloadFromJWT(cookie))?.id;

    const user = (
      await db
        .select({
          id: users.id,
          minecraft_username: users.minecraftUsername,
          minecraft_uuid: users.minecraftUuid,
        })
        .from(users)
        .where(eq(users.id, id))
    )[0];

    if (!user)
      return new Response(JSON.stringify({ message: 'User not found' }), {
        status: 404,
      });

    // Check if minecraft_username has changed
    const minecraftProfile = await minecraftProfileFromUUID(
      user.minecraft_uuid,
    );
    if (minecraftProfile.name !== user.minecraft_username) {
      // Update the user's minecraft_username
      const updatedUser = (
        await db
          .update(users)
          .set({ minecraftUsername: minecraftProfile.name })
          .where(eq(users.id, id))
          .returning({ minecraft_username: users.minecraftUsername })
      )[0];

      return new Response(JSON.stringify(updatedUser), { status: 200 });
    }

    return new Response(
      JSON.stringify({ message: 'Minecraft username is up to date' }),
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Unauthorized' }), {
      status: 401,
    });
  }
}
