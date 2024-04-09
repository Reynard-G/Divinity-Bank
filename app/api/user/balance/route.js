import { cookies } from 'next/headers';

import TransactionType from '@/constants/TransactionType';
import TransactionStatus from '@/constants/TransactionStatus';
import prisma from '@/lib/db';
import getPayloadFromJWT from '@/utils/getPayloadFromJWT';

export async function GET() {
  const cookie = cookies().get('authorization')?.value;

  try {
    const id = (await getPayloadFromJWT(cookie))?.id;

    // Using Promise.all to execute both queries concurrently
    // This is more efficient than executing them sequentially with await
    const [creditSumResult, debitSumResult, feeResult] = await Promise.all([
      prisma.transactions.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          user_id: id,
          transaction_type: TransactionType.CREDIT,
          status: TransactionStatus.SUCCESS,
        },
      }),
      prisma.transactions.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          user_id: id,
          transaction_type: TransactionType.DEBIT,
          status: TransactionStatus.SUCCESS,
        },
      }),
      prisma.transactions.aggregate({
        _sum: {
          fee: true,
        },
        where: {
          user_id: id,
          status: TransactionStatus.SUCCESS,
        },
      }),
    ]);

    const creditSum = creditSumResult?._sum?.amount ?? 0.0;
    const debitSum = debitSumResult?._sum?.amount ?? 0.0;
    const feeSum = feeResult?._sum?.fee ?? 0.0;
    const userBalance = creditSum.sub(debitSum).sub(feeSum).toNumber();

    return new Response(JSON.stringify({ userId: id, balance: userBalance }), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response('Unauthorized', { status: 401 });
  }
}
