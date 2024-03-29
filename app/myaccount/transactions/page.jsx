'use client';

import { Divider } from '@nextui-org/divider';
import useSWR from 'swr';

import UserDashboardLayout from '@/components/Layout/UserDashboardLayout';
import TransactionsTable from '@/components/Table/TransactionsTable';
import fetcher from '@/utils/fetcher';
import API from '@/constants/API';

export default function Transactions() {
  const { data, isLoading } = useSWR(API.TRANSACTIONS, fetcher);

  return (
    <>
      <UserDashboardLayout>
        <div className='flex flex-col'>
          <h1 className='text-3xl font-bold'>Transactions</h1>
          <p className='text-sm text-default-500'>
            View details about your transaction history
          </p>
        </div>

        <Divider />

        <div className='flex flex-col'>
          <TransactionsTable
            isLoading={isLoading}
            data={data ?? []}
          />
        </div>
      </UserDashboardLayout>
    </>
  );
}
