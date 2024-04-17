'use server';

import { cookies } from 'next/headers';

import { compare, hash } from 'bcrypt';
import { eq } from 'drizzle-orm';

import AccountType from '@/constants/AccountType';
import { db } from '@/lib/db';
import { users } from '@/schema';
import getPayloadFromJWT from '@/utils/getPayloadFromJWT';
import isValidDiscordUsername from '@/utils/isValidDiscordUsername';
import minecraftProfileFromUsername from '@/utils/minecraftProfileFromUsername';
import redashUUID from '@/utils/redashUUID';
import signPayloadWithJWT from '@/utils/signPayloadWithJWT';

export async function register(formData) {
  const username = formData.get('minecraftUsername');
  const discord = formData.get('discordUsername');
  const password = formData.get('password');

  try {
    const mojangProfile = await minecraftProfileFromUsername(username);
    if (!mojangProfile) return null;

    const hashedPassword = await hash(password, 12);
    const user = (
      await db
        .insert(users)
        .values({
          accountType: AccountType.PERSONAL,
          minecraftUsername: mojangProfile.name,
          minecraftUuid: redashUUID(mojangProfile.id),
          discordUsername: discord,
          password: hashedPassword,
        })
        .returning({ id: users.id })
    )[0];

    logout();

    return user.id;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function login(formData) {
  const username = formData.get('minecraftUsername');
  const password = formData.get('password');
  const remember = formData.get('remember');

  try {
    const user = (
      await db
        .select({
          id: users.id,
          password: users.password,
        })
        .from(users)
        .where(eq(users.minecraftUsername, username))
    )[0];

    const isPasswordValid = await compare(password, user?.password);
    if (!isPasswordValid) return null;

    const expires = remember
      ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
      : new Date(Date.now() + 1000 * 60 * 60); // 30 days or 1 hour
    const session = await signPayloadWithJWT({ id: user.id }, expires);

    cookies().set('authorization', session, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      expires,
    });

    return user.id;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function logout() {
  cookies().delete('authorization');
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
        })
        .where(eq(users.id, userId))
        .returning({ discordUsername: users.discordUsername })
    )[0];

    return user;
  } catch (error) {
    return null;
  }
}

export async function updatePassword(formData) {
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
      })
      .where(eq(users.id, userId));

    await logout();

    return true;
  } catch (error) {
    return null;
  }
}
