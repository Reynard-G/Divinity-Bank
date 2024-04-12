'use client';

import { useState } from 'react';

import useSWR from 'swr';

import StatCard from '@/components/Card/StatCard';
import API from '@/constants/API';
import { useUserContext } from '@/contexts';
import fetcher from '@/utils/fetcher';
import formatCurrency from '@/utils/formatCurrency';
import formatPercentage from '@/utils/formatPercentage';

export default function StatCardLayout() {
  const { accountType, interestRate } = useUserContext();
  const [userBalance, setUserBalance] = useState(0);
  useSWR(API.USER_BALANCE, fetcher, {
    onSuccess: (data) => {
      setUserBalance(data?.balance ?? 0);
    },
  });

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
