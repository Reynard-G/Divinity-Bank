import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';
import { compare } from 'bcrypt';
import * as jose from 'jose';

export async function POST(req) {
  const { username, password, remember } = await req.json();

  const prisma = new PrismaClient();

  const user = await prisma.users.findFirst({
    where: {
      minecraft_username: username,
    },
  });

  if (!user) {
    return new Response('Invalid username or password', { status: 401 });
  }

  const passwordMatch = await compare(password, user.password);

  if (!passwordMatch) {
    return new Response('Invalid username or password', { status: 401 });
  }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const expirationTime = remember ? '30 d' : '1 hr';

  const token = await new jose.SignJWT({ id: user.id })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .sign(secret);

  cookies().set('authorization', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: remember ? 60 * 60 * 24 * 30 : 60 * 60, // 30 days or 1 hour
  });

  return new Response('Logged in successfully', { status: 200 });
}
