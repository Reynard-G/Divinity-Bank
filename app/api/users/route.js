import prisma from '@/lib/db';

export const runtime = 'edge';

export async function GET() {
  try {
    const users = await prisma.users.findMany({
      select: {
        id: true,
        discord_username: true,
        minecraft_uuid: true,
        minecraft_username: true,
      },
      cacheStrategy: {
        ttl: 15,
        swr: 30,
      },
    });

    return new Response(JSON.stringify(users), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response('Unauthorized', { status: 401 });
  }
}
