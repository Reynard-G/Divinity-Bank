import { cookies } from 'next/headers';

import TransactionStatus from '@/constants/TransactionStatus';
import TransactionType from '@/constants/TransactionType';
import prisma from '@/lib/db';
import getPayloadFromJWT from '@/utils/getPayloadFromJWT';

export const runtime = 'edge';

export async function GET() {
  const cookie = cookies().get('authorization')?.value;

  try {
    const id = (await getPayloadFromJWT(cookie))?.id;

    const userBalance = await prisma.$queryRaw`
      SELECT
        (
          SUM(CASE WHEN transaction_type = ${TransactionType.CREDIT} AND status = ${TransactionStatus.SUCCESS} THEN amount ELSE 0 END) -
          SUM(CASE WHEN transaction_type = ${TransactionType.DEBIT} AND status = ${TransactionStatus.SUCCESS} THEN amount ELSE 0 END) -
          SUM(fee)
        ) AS user_balance
      FROM "Transactions"
      WHERE "user_id" = ${id} AND "status" = ${TransactionStatus.SUCCESS};
    `;

    return new Response(
      JSON.stringify({
        userId: id,
        balance: userBalance[0]?.user_balance ?? 0,
      }),
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(error);
    return new Response('Unauthorized', { status: 401 });
  }
}
