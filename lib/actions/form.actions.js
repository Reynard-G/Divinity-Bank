'use server';

import { cookies } from 'next/headers';

import { compare, hash } from 'bcrypt';
import { eq } from 'drizzle-orm';

import AccountType from '@/constants/AccountType';
import { users } from '@/drizzle/schema';
import { db } from '@/lib/db';
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

    await db
      .update(users)
      .set({
        lastSignInAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return user.id;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function logout() {
  cookies().delete('authorization');
}
