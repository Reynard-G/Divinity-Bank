import { cookies } from 'next/headers';

import { desc, eq, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

import { transactions, users } from '@/drizzle/schema';
import { db } from '@/lib/db';
import getPayloadFromJWT from '@/utils/getPayloadFromJWT';

export const preferredRegion = ['sfo1'];
export const dynamic = 'force-dynamic';

export async function GET() {
  const cookie = cookies().get('authorization')?.value;

  try {
    const id = (await getPayloadFromJWT(cookie))?.id;

    const user = alias(users, 'user');
    const createdByUser = alias(users, 'createdByUser');

    const userTransactions = await db
      .select({
        id: transactions.id,
        user_id: transactions.userId,
        created_user_id: transactions.createdByUserId,
        minecraft_username: user.minecraftUsername,
        minecraft_uuid: user.minecraftUuid,
        created_minecraft_username: createdByUser.minecraftUsername,
        created_minecraft_uuid: createdByUser.minecraftUuid,
        amount: transactions.amount,
        fee: transactions.fee,
        transaction_type: transactions.transactionType,
        payment_type: transactions.paymentType,
        attachment: transactions.attachment,
        note: transactions.note,
        status: transactions.status,
        created_at: sql`EXTRACT(EPOCH FROM ${transactions.createdAt})`,
        updated_at: sql`EXTRACT(EPOCH FROM ${transactions.updatedAt})`,
      })
      .from(transactions)
      .leftJoin(user, eq(transactions.userId, user.id))
      .leftJoin(
        createdByUser,
        eq(transactions.createdByUserId, createdByUser.id),
      )
      .where(eq(transactions.userId, id))
      .orderBy(desc(transactions.createdAt));

    return new Response(JSON.stringify(userTransactions), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Unauthorized' }), {
      status: 401,
    });
  }
}
