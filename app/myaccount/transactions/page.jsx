import dynamic from 'next/dynamic';
import { cookies } from 'next/headers';

import { Divider } from '@nextui-org/divider';
import { desc, eq, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

import { transactions, users } from '@/drizzle/schema';
import { db } from '@/lib/db';
import getPayloadFromJWT from '@/utils/getPayloadFromJWT';

const TransactionsTable = dynamic(
  () => import('@/components/Table/TransactionsTable'),
);

export const metadata = {
  title: 'Divinity: Transactions',
  description: 'View details about your transaction history.',
};

async function getTransactions() {
  const cookie = cookies().get('authorization')?.value;
  const id = (await getPayloadFromJWT(cookie))?.id;

  const user = alias(users, 'user');
  const createdByUser = alias(users, 'createdByUser');

  return await db
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
    .leftJoin(createdByUser, eq(transactions.createdByUserId, createdByUser.id))
    .where(eq(transactions.userId, id))
    .orderBy(desc(transactions.createdAt));
}

export default async function Transactions() {
  const transactions = await getTransactions();

  return (
    <div className='flex flex-col gap-4 p-6'>
      <div className='flex flex-col'>
        <h1 className='text-3xl font-bold'>Transactions</h1>
        <p className='text-sm text-default-500'>
          View details about your transaction history
        </p>
      </div>

      <Divider />

      <TransactionsTable transactions={transactions} />
    </div>
  );
}
