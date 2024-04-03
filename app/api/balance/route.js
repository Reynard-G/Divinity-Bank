import { cookies } from 'next/headers';

import { Prisma } from '@prisma/client';

import TransactionType from '@/constants/TransactionType';
import prisma from '@/lib/db';
import getPayloadFromJWT from '@/utils/getPayloadFromJWT';

export async function GET() {
  const cookie = cookies().get('authorization')?.value;

  try {
    const id = (await getPayloadFromJWT(cookie))?.id;

    const creditSum =
      (
        await prisma.transactions.aggregate({
          _sum: {
            amount: true,
          },
          where: {
            user_id: id,
            transaction_type: TransactionType.CREDIT,
          },
        })
      )._sum.amount || Prisma.Decimal(0.0);

    const debitSum =
      (
        await prisma.transactions.aggregate({
          _sum: {
            amount: true,
          },
          where: {
            user_id: id,
            transaction_type: TransactionType.DEBIT,
          },
        })
      )._sum.amount || Prisma.Decimal(0.0);

    const userBalance = creditSum.sub(debitSum).toString();

    return new Response(JSON.stringify({ userId: id, balance: userBalance }), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response('Unauthorized', { status: 401 });
  }
}
