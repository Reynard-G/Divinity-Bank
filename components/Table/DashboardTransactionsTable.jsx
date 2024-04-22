import { cookies } from 'next/headers';

import { Avatar } from '@nextui-org/avatar';
import { Chip } from '@nextui-org/chip';
import { Link } from '@nextui-org/link';
import { desc, eq, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { ArrowRightLeft, Coins, Minus, Plus } from 'lucide-react';

import PaymentType from '@/constants/PaymentType';
import TransactionStatusColor from '@/constants/TransactionStatusColor';
import { transactions, users } from '@/drizzle/schema';
import { db } from '@/lib/db';
import crafatarURL from '@/utils/crafatarURL';
import formatCurrency from '@/utils/formatCurrency';
import getPayloadFromJWT from '@/utils/getPayloadFromJWT';
import reformatTransactionByDate from '@/utils/reformatTransactionByDate';

const paymentTypeIcons = {
  [PaymentType.DEPOSIT]: (
    <Plus color='gray' size={20} className='self-center' />
  ),
  [PaymentType.WITHDRAW]: (
    <Minus color='gray' size={20} className='self-center' />
  ),
  [PaymentType.TRANSFER]: (
    <ArrowRightLeft color='gray' size={20} className='self-center' />
  ),
  [PaymentType.INTEREST]: (
    <Coins color='gray' size={20} className='self-center' />
  ),
};

async function getUserTransactions(limit = 10) {
  const cookie = cookies().get('authorization')?.value;
  const id = (await getPayloadFromJWT(cookie))?.id;

  const user = alias(users, 'user');
  const createdByUser = alias(users, 'createdByUser');

  const userTransactions = (
    await db
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
      .orderBy(desc(transactions.createdAt))
  ).slice(0, limit);
  const formattedTransactions = reformatTransactionByDate(userTransactions);

  return formattedTransactions;
}

export default async function DashboardTransactionsTable() {
  const formattedTransactions = await getUserTransactions(10);

  return (
    <table className='w-full text-left'>
      <thead className='sr-only'>
        <tr>
          <th>Amount</th>
          <th className='hidden sm:table-cell'>User</th>
          <th>More details</th>
        </tr>
      </thead>

      <tbody>
        {formattedTransactions.map((day) => (
          <>
            <tr
              scope='colgroup'
              colSpan={3}
              className='text-sm leading-6 text-neutral-200'
            >
              <th className='relative isolate py-2 font-semibold'>
                <time dateTime={day.dateTime}>{day.dateTime}</time>
                <div className='absolute inset-y-0 right-full -z-10 w-screen border-b border-neutral-800 bg-neutral-900' />
                <div className='absolute inset-y-0 left-0 -z-10 w-screen border-b border-neutral-800 bg-neutral-900' />
              </th>
            </tr>
            {day.transactions.map((transaction) => (
              <tr key={transaction.id}>
                {/* Amount */}
                <td className='relative py-5 pr-6'>
                  <div className='flex gap-x-6'>
                    {paymentTypeIcons[transaction.payment_type]}
                    <div className='flex-auto'>
                      <div className='flex items-center gap-x-3'>
                        <div className='text-sm font-medium leading-6 text-neutral-200'>
                          {formatCurrency(transaction.amount)}
                        </div>
                        <Chip
                          color={TransactionStatusColor[transaction.status]}
                          size='md'
                          radius='sm'
                          variant='flat'
                        >
                          {transaction.status}
                        </Chip>
                      </div>
                      {Number(transaction.fee) > 0 && (
                        <div className='mt-1 text-xs leading-5 text-neutral-500'>
                          {formatCurrency(transaction.fee)} fee
                        </div>
                      )}
                    </div>
                  </div>
                  <div className='absolute bottom-0 right-full h-px w-screen bg-neutral-800' />
                  <div className='absolute bottom-0 left-0 h-px w-screen bg-neutral-800' />
                </td>

                <td className='hidden py-5 pr-6 sm:table-cell'>
                  <div className='flex items-center gap-x-3'>
                    <Avatar
                      radius='lg'
                      src={crafatarURL(transaction.created_minecraft_uuid, 40)}
                    />
                    <div>
                      <div className='text-sm leading-6 text-neutral-200'>
                        {transaction.created_minecraft_username}
                      </div>
                      <div className='mt-1 text-xs leading-5 text-neutral-500'>
                        {transaction.note}
                      </div>
                    </div>
                  </div>
                </td>

                {/* More details */}
                <td className='py-5 text-right'>
                  <div className='flex justify-end'>
                    <Link
                      size='sm'
                      underline='hover'
                      href={`/myaccount/transactions/${transaction.id}`}
                    >
                      View
                      <span className='hidden md:inline'>&nbsp;details</span>
                    </Link>
                  </div>
                  <div className='mt-1 text-xs leading-5 text-neutral-500'>
                    <span className='hidden md:inline'>Transaction&nbsp;</span>
                    ID #{transaction.id}
                  </div>
                </td>
              </tr>
            ))}
          </>
        ))}
      </tbody>
    </table>
  );
}
