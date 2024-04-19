import { cookies } from 'next/headers';

import { eq, sql } from 'drizzle-orm';

import API from '@/constants/API';
import Page from '@/constants/Page';
import { accountTypes, users } from '@/drizzle/schema';
import { db } from '@/lib/db';
import getIPFromHeaders from '@/utils/getIPFromHeaders';
import getPayloadFromJWT from '@/utils/getPayloadFromJWT';

export const preferredRegion = ['sfo1'];
export const dynamic = 'force-dynamic';

export async function GET() {
  const cookie = cookies().get('authorization')?.value;

  try {
    const id = (await getPayloadFromJWT(cookie))?.id;
    if (!id)
      return new Response(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
      });

    const user = (
      await db
        .select({
          id: users.id,
          discord_username: users.discordUsername,
          minecraft_uuid: users.minecraftUuid,
          minecraft_username: users.minecraftUsername,
          created_at: sql`EXTRACT(EPOCH FROM ${users.createdAt})`,
          updated_at: sql`EXTRACT(EPOCH FROM ${users.updatedAt})`,
          account_type: accountTypes.name,
          interest_rate: accountTypes.interestRate,
          transaction_fee: accountTypes.transactionFee,
        })
        .from(users)
        .leftJoin(accountTypes, eq(users.accountType, accountTypes.name))
        .where(eq(users.id, id))
    )[0];
    if (!user)
      return new Response(JSON.stringify({ message: 'User not found' }), {
        status: 404,
      });

    const ip = getIPFromHeaders();
    await db
      .update(users)
      .set({
        lastIpAccessed: ip,
      })
      .where(eq(users.id, id));

    // Call `updateMinecraftUsername` to check if the minecraft_username has changed
    // Don't wait for the response, just return the user
    fetch(Page.BASE_URL + API.USER_UPDATE_MINECRAFT_USERNAME, {
      method: 'POST',
    });

    return new Response(JSON.stringify(user), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
    });
  }
}
