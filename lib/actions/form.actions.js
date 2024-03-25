'use server';

import { cookies } from 'next/headers';

import { compare } from 'bcrypt';

import prisma from '@/lib/db';
import getPayloadFromJWT from '@/utils/getPayloadFromJWT';
import signPayloadWithJWT from '@/utils/signPayloadWithJWT';

export async function register(formData) {
  const username = formData.get('minecraftUsername');
  const discord = formData.get('discordUsername');
  const password = formData.get('password');

  try {
    const user = await prisma.users.create({
      data: {
        minecraft_username: username,
        discord_username: discord,
        password,
      },
    });

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
    const user = await prisma.users.findFirst({
      where: {
        minecraft_username: username,
      },
      select: {
        id: true,
        password: true,
      },
    });

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
  if (!userId) {
    cookies().delete('authorization');
    return null;
  }

  const discordUsername = formData.get('discordUsername').trim();

  try {
    const user = await prisma.users.update({
      where: { id: userId },
      data: {
        discord_username: discordUsername,
      },
      select: {
        discord_username: true,
      },
    });

    return user;
  } catch (error) {
    return null;
  }
}
