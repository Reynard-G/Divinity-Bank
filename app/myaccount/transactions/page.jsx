'use client';

import { Divider } from '@nextui-org/divider';
import useSWR from 'swr';

import TransactionsTable from '@/components/Table/TransactionsTable';
import API from '@/constants/API';
import fetcher from '@/utils/fetcher';

export default function Transactions() {
  const { data, isLoading } = useSWR(API.USER_TRANSACTIONS, fetcher);

  return (
    <>
      <div className='flex flex-col'>
        <h1 className='text-3xl font-bold'>Transactions</h1>
        <p className='text-sm text-default-500'>
          View details about your transaction history
        </p>
      </div>

      <Divider />

      <div className='flex flex-col'>
        <TransactionsTable isLoading={isLoading} transactions={data} />
      </div>
    </>
  );
}
