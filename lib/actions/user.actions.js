'use server';

import { cookies } from 'next/headers';

import { compare, hash } from 'bcrypt';
import { eq } from 'drizzle-orm';

import { users } from '@/drizzle/schema';
import { db } from '@/lib/db';
import getPayloadFromJWT from '@/utils/getPayloadFromJWT';
import isValidDiscordUsername from '@/utils/isValidDiscordUsername';
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

export async function updateAccountInfo(formData) {
  const cookie = cookies().get('authorization')?.value;

  const userId = (await getPayloadFromJWT(cookie))?.id;
  if (!userId) return null;

  const discordUsername = isValidDiscordUsername(
    formData.get('discordUsername').trim(),
  );

  if (!discordUsername) return null;

  try {
    const user = (
      await db
        .update(users)
        .set({
          discordUsername: discordUsername,
          lastDiscordUsernameChangeAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning({ discordUsername: users.discordUsername })
    )[0];

    return user;
  } catch (error) {
    return null;
  }
}

export async function updateKnownPassword(formData) {
  const cookie = cookies().get('authorization')?.value;

  const userId = (await getPayloadFromJWT(cookie))?.id;
  if (!userId) return null;

  const currentPassword = formData.get('currentPassword');
  const newPassword = formData.get('newPassword');

  try {
    const user = (
      await db
        .select({
          password: users.password,
        })
        .from(users)
        .where(eq(users.id, userId))
    )[0];

    const isPasswordValid = await compare(currentPassword, user.password);
    if (!isPasswordValid) return null;

    const hashedPassword = await hash(newPassword, 12);
    await db
      .update(users)
      .set({
        password: hashedPassword,
        lastPasswordChangeAt: new Date(),
      })
      .where(eq(users.id, userId));

    cookies().delete('authorization');

    return true;
  } catch (error) {
    return null;
  }
}
