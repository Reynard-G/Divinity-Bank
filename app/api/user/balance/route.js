import { cookies } from 'next/headers';

import TransactionStatus from '@/constants/TransactionStatus';
import TransactionType from '@/constants/TransactionType';
import prisma from '@/lib/db';
import getPayloadFromJWT from '@/utils/getPayloadFromJWT';

export async function GET() {
  const cookie = cookies().get('authorization')?.value;

  try {
    const id = (await getPayloadFromJWT(cookie))?.id;

    const query = `
      SELECT
        SUM(CASE WHEN transaction_type = ? AND status = ? THEN amount ELSE 0 END) -
        SUM(CASE WHEN transaction_type = ? AND status = ? THEN amount ELSE 0 END) -
        SUM(fee) AS initiatorUserBalance
      FROM Transactions
      WHERE user_id = ?
        AND status = ?
    `;

    const userBalance =
      (
        await prisma.$queryRawUnsafe(
          query,
          TransactionType.CREDIT,
          TransactionStatus.SUCCESS,
          TransactionType.DEBIT,
          TransactionStatus.SUCCESS,
          id,
          TransactionStatus.SUCCESS,
        )
      )[0]?.initiatorUserBalance ?? 0.0;

    return new Response(JSON.stringify({ userId: id, balance: userBalance }), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response('Unauthorized', { status: 401 });
  }
}
