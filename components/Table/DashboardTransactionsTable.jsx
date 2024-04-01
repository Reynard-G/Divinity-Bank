import { Fragment } from 'react';

import { Avatar } from '@nextui-org/avatar';
import { Chip } from '@nextui-org/chip';
import { Link } from '@nextui-org/link';
import { ArrowRightLeft, Coins, Minus, Plus } from 'lucide-react';

import PaymentType from '@/constants/PaymentType';
import TransactionStatus from '@/constants/TransactionStatus';
import formatCurrency from '@/utils/formatCurrency';

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

const transactionStatusColors = {
  [TransactionStatus.PENDING]: 'warning',
  [TransactionStatus.SUCCESS]: 'success',
  [TransactionStatus.FAILED]: 'error',
};

export default function DashboardTransactionsTable({ transactions = [] }) {
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
        {transactions.map((day) => (
          <Fragment key={day.dateTime}>
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
                      <div className='flex items-start gap-x-3'>
                        <div className='text-sm font-medium leading-6 text-neutral-200'>
                          {formatCurrency(transaction.amount)}
                        </div>
                        <Chip
                          color={transactionStatusColors[transaction.status]}
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
                      src={`https://crafatar.com/avatars/${transaction.created_minecraft_uuid}`}
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
                      View transaction
                    </Link>
                  </div>
                  <div className='mt-1 text-xs leading-5 text-neutral-500'>
                    Transaction #{transaction.id}
                  </div>
                </td>
              </tr>
            ))}
          </Fragment>
        ))}
      </tbody>
    </table>
  );
}
