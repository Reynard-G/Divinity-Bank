'use client';

import dynamic from 'next/dynamic';

import { Divider } from '@nextui-org/divider';
import useSWR from 'swr';

const TransactionsTable = dynamic(
  () => import('@/components/Table/TransactionsTable'),
);
import API from '@/constants/API';
import fetcher from '@/utils/fetcher';

export default function Transactions() {
  const { data, isLoading } = useSWR(API.USER_TRANSACTIONS, fetcher);

  return (
    <div className='flex flex-col gap-4 p-6'>
      <div className='flex flex-col'>
        <h1 className='text-3xl font-bold'>Transactions</h1>
        <p className='text-sm text-default-500'>
          View details about your transaction history
        </p>
      </div>

      <Divider />

      <TransactionsTable isLoading={isLoading} transactions={data} />
    </div>
  );
}
