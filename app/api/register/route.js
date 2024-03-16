import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

export async function POST(req) {
  const { minecraftUsername, discordUsername, password } = await req.json();

  const prisma = new PrismaClient();

  const user = await prisma.users.findFirst({
    where: {
      minecraft_username: minecraftUsername,
    },
  });

  if (user) {
    return new Response('Username already exists', { status: 409 });
  }

  // Check if username exists in Minecraft API
  const mojangResponse = await fetch(
    `https://api.mojang.com/users/profiles/minecraft/${minecraftUsername}`,
  );
  const minecraftUser = await mojangResponse.json();

  console.log(minecraftUser);
  if (!mojangResponse.ok) {
    return new Response('Minecraft username is invalid or does not exist', {
      status: 400,
    });
  }

  const hashedPassword = await hash(password, 12);

  await prisma.users.create({
    data: {
      minecraft_uuid: minecraftUser.id,
      minecraft_username: minecraftUsername,
      discord_username: discordUsername,
      password: hashedPassword,
    },
  });

  return new Response('User registered successfully', { status: 200 });
}
