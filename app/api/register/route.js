import { hash } from 'bcrypt';

import prisma from '@/lib/db';
import minecraftProfileFromUsername from '@/utils/minecraftProfileFromUsername';
import redashUUID from '@/utils/redashUUID';

export async function POST(req) {
  const { minecraftUsername, discordUsername, password } = await req.json();

  const user = await prisma.users.findFirst({
    where: {
      minecraft_username: minecraftUsername,
    },
    select: {
      id: true,
    },
  });

  if (user) {
    return new Response('Username already exists', { status: 409 });
  }

  const minecraftUser = await minecraftProfileFromUsername({
    minecraftUsername,
  });
  if (!minecraftUser) {
    return new Response('Minecraft username is invalid or does not exist', {
      status: 400,
    });
  }

  const hashedPassword = await hash(password, 12);

  await prisma.users.create({
    data: {
      minecraft_uuid: redashUUID(minecraftUser.id),
      minecraft_username: minecraftUsername,
      discord_username: discordUsername,
      password: hashedPassword,
    },
  });

  return new Response('User registered successfully', { status: 200 });
}
