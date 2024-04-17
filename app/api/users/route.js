import { users } from '@/drizzle/schema';
import { db } from '@/lib/db';

export const preferredRegion = ['sfo1'];
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        discord_username: users.discordUsername,
        minecraft_uuid: users.minecraftUuid,
        minecraft_username: users.minecraftUsername,
      })
      .from(users);

    return new Response(JSON.stringify(allUsers), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Unauthorized' }), {
      status: 401,
    });
  }
}
