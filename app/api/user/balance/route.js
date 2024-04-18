import { cookies } from 'next/headers';

import { eq, sql } from 'drizzle-orm';

import TransactionStatus from '@/constants/TransactionStatus';
import TransactionType from '@/constants/TransactionType';
import { transactions } from '@/drizzle/schema';
import { db } from '@/lib/db';
import getPayloadFromJWT from '@/utils/getPayloadFromJWT';

export const runtime = 'edge';
export const preferredRegion = ['sfo1'];
export const dynamic = 'force-dynamic';

export async function GET() {
  const cookie = cookies().get('authorization')?.value;

  try {
    const id = (await getPayloadFromJWT(cookie))?.id;

    const userBalance = (
      await db
        .select({
          user_id: transactions.userId,
          created_user_id: transactions.createdByUserId,
          balance: sql`(
          SUM(CASE WHEN transaction_type = ${TransactionType.CREDIT} AND status = ${TransactionStatus.SUCCESS} THEN amount ELSE 0 END) -
          SUM(CASE WHEN transaction_type = ${TransactionType.DEBIT} AND status = ${TransactionStatus.SUCCESS} THEN amount ELSE 0 END) -
          SUM(fee)
        )`,
        })
        .from(transactions)
        .where(
          eq(transactions.userId, id),
          eq(transactions.status, TransactionStatus.SUCCESS),
        )
        .groupBy(transactions.userId, transactions.createdByUserId)
    )[0];

    return new Response(JSON.stringify(userBalance), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Unauthorized' }), {
      status: 401,
    });
  }
}
