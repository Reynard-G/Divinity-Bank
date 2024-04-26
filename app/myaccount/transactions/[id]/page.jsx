import { cookies } from 'next/headers';

import { Image } from '@nextui-org/image';
import { eq, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

import { anta } from '@/app/fonts';
import { transactions, users } from '@/drizzle/schema';
import { db } from '@/lib/db';
import cn from '@/utils/cn';
import formatCurrency from '@/utils/formatCurrency';
import formatUnix from '@/utils/formatUnix';
import getPayloadFromJWT from '@/utils/getPayloadFromJWT';

async function getTransaction(transactionId) {
  const user = alias(users, 'user');
  const createdByUser = alias(users, 'createdByUser');

  // Check if transactionId is an integer
  const transactionIdInt = parseInt(transactionId);
  if (!Number.isInteger(transactionIdInt)) return null;

  return (
    await db
      .select({
        id: transactions.id,
        user_id: transactions.userId,
        discord_username: user.discordUsername,
        created_discord_username: createdByUser.discordUsername,
        minecraft_username: user.minecraftUsername,
        created_minecraft_username: createdByUser.minecraftUsername,
        amount: transactions.amount,
        fee: transactions.fee,
        transaction_type: transactions.transactionType,
        payment_type: transactions.paymentType,
        attachment: transactions.attachment,
        note: transactions.note,
        status: transactions.status,
        created_at: sql`EXTRACT(EPOCH FROM ${transactions.createdAt})`,
      })
      .from(transactions)
      .leftJoin(user, eq(transactions.userId, user.id))
      .leftJoin(
        createdByUser,
        eq(transactions.createdByUserId, createdByUser.id),
      )
      .where(eq(transactions.id, transactionId))
  )[0];
}

async function canUserViewTransaction(transactionId) {
  const cookie = cookies().get('authorization')?.value;
  const id = (await getPayloadFromJWT(cookie))?.id;

  // Check if the user is the owner of the transaction
  const transaction = await getTransaction(transactionId);
  if (transaction?.user_id === id) return true;

  // Check if the user is an admin
  /* *** This is a placeholder for now *** */

  return false;
}

export default async function Transaction({ params }) {
  const transactionId = params.id;

  const transaction = await getTransaction(transactionId);
  if (!transaction) {
    return (
      <div
        className={cn(
          'flex h-svh items-center justify-center text-2xl font-bold',
          anta.className,
        )}
      >
        Transaction not found
      </div>
    );
  }

  if (!(await canUserViewTransaction(transactionId))) {
    return (
      <div
        className={cn(
          'flex h-svh items-center justify-center text-2xl font-bold',
          anta.className,
        )}
      >
        You do not have permission to view this transaction
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-4 p-6'>
      <div className='flex flex-col'>
        <h1 className='text-3xl font-bold'>Transaction</h1>
        <p className='text-sm text-default-500'>
          View details of a transaction
        </p>
      </div>

      <div className='border-t border-default-300'>
        <dl className='divide-y divide-default-300'>
          <div className='px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0'>
            <dt className='text-md font-semibold leading-6 text-default-600'>
              User
            </dt>
            <dd className='text-md mt-1 leading-6 text-default-500 sm:col-span-2 sm:mt-0'>
              {transaction.minecraft_username} ({transaction.discord_username})
            </dd>
          </div>

          <div className='px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0'>
            <dt className='text-md font-semibold leading-6 text-default-600'>
              Initiated By
            </dt>
            <dd className='text-md mt-1 leading-6 text-default-500 sm:col-span-2 sm:mt-0'>
              {transaction.created_minecraft_username} (
              {transaction.created_discord_username})
            </dd>
          </div>

          <div className='px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0'>
            <dt className='text-md font-semibold leading-6 text-default-600'>
              Amount
            </dt>
            <dd className='text-md mt-1 leading-6 text-default-500 sm:col-span-2 sm:mt-0'>
              {formatCurrency(transaction.amount, transaction.transaction_type)}
            </dd>
          </div>

          {Number(transaction.fee) > 0.0 && (
            <div className='px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0'>
              <dt className='text-md font-semibold leading-6 text-default-600'>
                Fee
              </dt>
              <dd className='text-md mt-1 leading-6 text-default-500 sm:col-span-2 sm:mt-0'>
                {formatCurrency(transaction.fee)}
              </dd>
            </div>
          )}

          <div className='px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0'>
            <dt className='text-md font-semibold leading-6 text-default-600'>
              Payment Type
            </dt>
            <dd className='text-md mt-1 leading-6 text-default-500 sm:col-span-2 sm:mt-0'>
              {transaction.payment_type}
            </dd>
          </div>

          <div className='px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0'>
            <dt className='text-md font-semibold leading-6 text-default-600'>
              Note
            </dt>
            <dd className='text-md mt-1 leading-6 text-default-500 sm:col-span-2 sm:mt-0'>
              {transaction.note}
            </dd>
          </div>

          <div className='px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0'>
            <dt className='text-md font-semibold leading-6 text-default-600'>
              Status
            </dt>
            <dd className='text-md mt-1 leading-6 text-default-500 sm:col-span-2 sm:mt-0'>
              {transaction.status}
            </dd>
          </div>

          <div className='px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0'>
            <dt className='text-md font-semibold leading-6 text-default-600'>
              Created At
            </dt>
            <dd className='text-md mt-1 leading-6 text-default-500 sm:col-span-2 sm:mt-0'>
              {formatUnix(transaction.created_at, true)}
            </dd>
          </div>

          {transaction.attachment && (
            <div className='px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0'>
              <dt className='text-md font-semibold leading-6 text-default-600'>
                Attachment
              </dt>
              <dd className='text-md mt-1 leading-6 text-default-500 sm:col-span-2 sm:mt-0'>
                <Image
                  src={transaction.attachment}
                  alt='Transaction Attachment'
                  width={300}
                />
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  const transactionIds = await db
    .select({
      id: transactions.id,
    })
    .from(transactions);

  return transactionIds.map((transaction) => ({
    id: transaction.id.toString(),
  }));
}
