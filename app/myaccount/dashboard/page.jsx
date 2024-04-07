'use client';

import { useState } from 'react';

import { Button } from '@nextui-org/button';
import useSWR from 'swr';
import { ArrowDownToLine, ArrowUpToLine } from 'lucide-react';

import StatCard from '@/components/Card/StatCard';
import DashboardTransactionsTable from '@/components/Table/DashboardTransactionsTable';
import API from '@/constants/API';
import TransactionStatus from '@/constants/TransactionStatus';
import { useUserContext } from '@/contexts';
import fetcher from '@/utils/fetcher';
import formatCurrency from '@/utils/formatCurrency';
import formatPercentage from '@/utils/formatPercentage';
import DepositModalButton from '@/components/Button/DepositModalButton';
import WithdrawModalButton from '@/components/Button/WithdrawModalButton';

const timeFrameButtons = [
  { name: 'Last 7 days', value: 7 },
  { name: 'Last 30 days', value: 30 },
  { name: 'All-time', value: Infinity },
];

export default function Dashboard() {
  const { accountType, interestRate } = useUserContext();
  const [userBalance, setUserBalance] = useState(0);
  const [pendingTransactions, setPendingTransactions] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState(
    timeFrameButtons[0].value,
  );
  useSWR(API.USER_BALANCE, fetcher, {
    onSuccess: (data) => {
      setUserBalance(data?.balance ?? 0);
    },
  });
  useSWR(API.USER_TRANSACTIONS, fetcher, {
    onSuccess: (data) => {
      const pendingTransactionsData = data.filter(
        (transaction) => transaction.status === TransactionStatus.PENDING,
      );
      setPendingTransactions(pendingTransactionsData.length);

      // Reformat data to group transactions by date
      // and display relative time for each date, up to 7 days
      const reformattedData = data.reduce((acc, transaction) => {
        const date = new Date(transaction.created_at * 1000);
        const now = new Date();

        const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

        const daysDifference = Math.round(
          (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
        );

        let formattedDate;

        if (daysDifference === 0) {
          formattedDate = 'Today';
        } else if (daysDifference === 1) {
          formattedDate = 'Yesterday';
        } else if (daysDifference < 7) {
          formattedDate = rtf.format(-daysDifference, 'day');
        } else {
          formattedDate = date.toISOString().split('T')[0];
        }

        const existingEntry = acc.find(
          (entry) => entry.dateTime === formattedDate,
        );

        if (existingEntry) {
          existingEntry.transactions.push(transaction);
        } else {
          acc.push({ dateTime: formattedDate, transactions: [transaction] });
        }

        return acc;
      }, []);

      setTransactions(reformattedData);
    },
  });

  return (
    <>
      <div className='relative isolate overflow-hidden'>
        {/* Header */}
        <header className='pb-4 pt-6 sm:pb-6'>
          <div className='mx-auto flex max-w-7xl flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8'>
            <h1 className='text-base font-semibold leading-7 text-gray-200'>
              {accountType} Account
            </h1>
            <div className='order-last flex w-full gap-x-8 text-sm font-semibold leading-6 sm:order-none sm:w-auto sm:border-l sm:border-white/15 sm:pl-6 sm:leading-7'>
              {timeFrameButtons.map((button) => (
                <Button
                  key={button.name}
                  variant={
                    selectedTimeFrame === button.value ? 'flat' : 'light'
                  }
                  size='sm'
                  onClick={() => setSelectedTimeFrame(button.value)}
                >
                  {button.name}
                </Button>
              ))}
            </div>
          </div>
        </header>

        {/* Stats */}
        <div className='border-b-1 border-b-gray-200/10 lg:border-t-1 lg:border-t-gray-200/10'>
          <dl className='mx-auto grid max-w-7xl grid-cols-1 sm:grid-cols-2 lg:px-2 xl:grid-cols-4 xl:px-0'>
            <StatCard title='Balance' value={formatCurrency(userBalance)} />
            <StatCard
              title='Pending Transactions'
              value={pendingTransactions}
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
          </dl>
        </div>

        <div
          className='absolute left-0 top-full -z-10 mt-96 origin-top-left translate-y-40 -rotate-90 transform-gpu opacity-20 blur-3xl sm:left-1/2 sm:-ml-96 sm:-mt-10 sm:translate-y-0 sm:rotate-0 sm:transform-gpu sm:opacity-50'
          aria-hidden='true'
        >
          <div
            className='aspect-[1154/678] w-[72.125rem] bg-gradient-to-br from-[#FF80B5] to-[#9089FC]'
            style={{
              clipPath:
                'polygon(100% 38.5%, 82.6% 100%, 60.2% 37.7%, 52.4% 32.1%, 47.5% 41.8%, 45.2% 65.6%, 27.5% 23.4%, 0.1% 35.3%, 17.9% 0%, 27.7% 23.4%, 76.2% 2.5%, 74.2% 56%, 100% 38.5%)',
            }}
          />
        </div>
      </div>

      <div className='space-y-16 py-16 xl:space-y-20'>
        {/* Recent Activity Table */}
        <div>
          <div className='mx-auto flex max-w-7xl flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8'>
            <h2 className='text-base font-semibold leading-6 text-gray-200 lg:mx-0 lg:max-w-none'>
              Recent Activity
            </h2>
            <div className='order-last flex w-full gap-x-4 text-sm leading-6 sm:order-none sm:w-auto sm:border-l sm:border-white/15 sm:pl-6 sm:leading-7'>
              <DepositModalButton color='primary' size='sm' variant='ghost' startContent={<ArrowUpToLine size={16} />} />
              <WithdrawModalButton color='primary' size='sm' variant='ghost' startContent={<ArrowDownToLine size={16} />} />
            </div>
          </div>

          <div className='mt-6 overflow-hidden border-t-0 border-gray-100'>
            <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
              <div className='mx-auto max-w-2xl lg:mx-0 lg:max-w-none'>
                <DashboardTransactionsTable transactions={transactions} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
