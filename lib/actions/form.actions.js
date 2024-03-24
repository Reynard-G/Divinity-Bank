'use server';

import { cookies } from 'next/headers';

import { compare } from 'bcrypt';
import { SignJWT } from 'jose';

import prisma from '@/lib/db';

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

    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) return null;

    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const jwtSecret = process.env.JWT_SECRET;
    const encodedJwtSecret = new TextEncoder().encode(jwtSecret);

    const session = await new SignJWT({ id: user.id })
      .setProtectedHeader({ alg: 'HS512' })
      .setIssuedAt()
      .setExpirationTime(remember ? '30d' : '1h')
      .sign(encodedJwtSecret);

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
