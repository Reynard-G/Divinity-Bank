'use server';

import { cookies } from 'next/headers';

import { eq } from 'drizzle-orm';

import { users } from '@/drizzle/schema';
import { db } from '@/lib/db';
import getPayloadFromJWT from '@/utils/getPayloadFromJWT';
import minecraftProfileFromUUID from '@/utils/minecraftProfileFromUUID';

export async function syncMinecraftUsername() {
  const cookie = cookies().get('authorization')?.value;

  const userId = (await getPayloadFromJWT(cookie))?.id;
  if (!userId) return null;

  try {
    const user = (
      await db
        .select({
          id: users.id,
          minecraft_username: users.minecraftUsername,
          minecraft_uuid: users.minecraftUuid,
        })
        .from(users)
        .where(eq(users.id, userId))
    )[0];
    if (!user) return null;

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
          .where(eq(users.id, userId))
          .returning({ minecraft_username: users.minecraftUsername })
      )[0];

      return updatedUser;
    }

    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
}
