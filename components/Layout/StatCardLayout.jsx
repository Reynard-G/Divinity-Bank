import { cookies } from 'next/headers';

import { eq, sql } from 'drizzle-orm';

import StatCard from '@/components/Card/StatCard';
import TransactionStatus from '@/constants/TransactionStatus';
import TransactionType from '@/constants/TransactionType';
import { transactions } from '@/drizzle/schema';
import { db } from '@/lib/db';
import formatCurrency from '@/utils/formatCurrency';
import formatPercentage from '@/utils/formatPercentage';
import getPayloadFromJWT from '@/utils/getPayloadFromJWT';

async function getUserBalance() {
  const cookie = cookies().get('authorization')?.value;
  const id = (await getPayloadFromJWT(cookie))?.id;

  return (
    await db
      .select({
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
  )[0].balance;
}

export default async function StatCardLayout({ accountType, interestRate }) {
  const userBalance = await getUserBalance();

  return (
    <>
      <StatCard title='Balance' value={formatCurrency(userBalance)} />
      <StatCard
        title='Account Type'
        value={accountType}
        className='sm:border-l-1'
      />
      <StatCard
        title='Interest Rate'
        value={formatPercentage(interestRate)}
        className='lg:border-l-1'
      />
      <StatCard
        title='Outstanding Loans'
        value='Unavailable'
        className='sm:border-l-1'
      />
    </>
  );
}
