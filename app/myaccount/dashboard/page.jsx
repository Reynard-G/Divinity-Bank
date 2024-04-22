import dynamic from 'next/dynamic';
import { cookies } from 'next/headers';

import { eq } from 'drizzle-orm';
import { ArrowDownToLine, ArrowLeftRight, ArrowUpToLine } from 'lucide-react';

import { accountTypes, users } from '@/drizzle/schema';
import { db } from '@/lib/db';
import getPayloadFromJWT from '@/utils/getPayloadFromJWT';

const DepositModalButton = dynamic(
  () => import('@/components/Button/DepositModalButton'),
);
const TransferModalButton = dynamic(
  () => import('@/components/Button/TransferModalButton'),
);
const WithdrawModalButton = dynamic(
  () => import('@/components/Button/WithdrawModalButton'),
);
const DashboardTransactionsTable = dynamic(
  () => import('@/components/Table/DashboardTransactionsTable'),
);
const StatCardLayout = dynamic(
  () => import('@/components/Layout/StatCardLayout'),
);
import DashboardHeader from '@/components/Header/DashboardHeader';

export const metadata = {
  title: 'Divinity: Dashboard',
  description: 'View your account balance, recent transactions, and more.',
};

async function getUserAccountDetails() {
  const cookie = cookies().get('authorization')?.value;
  const id = (await getPayloadFromJWT(cookie))?.id;

  return (
    await db
      .select({
        account_type: accountTypes.name,
        interest_rate: accountTypes.interestRate,
      })
      .from(users)
      .leftJoin(accountTypes, eq(users.accountType, accountTypes.name))
      .where(eq(users.id, id))
  )[0];
}

export default async function Dashboard() {
  const account = await getUserAccountDetails();

  return (
    <>
      <div className='relative isolate overflow-hidden'>
        {/* Header */}
        <header className='pb-4 pt-6 sm:pb-6'>
          <div className='mx-auto flex max-w-7xl flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8'>
            <DashboardHeader accountType={account.account_type} />
          </div>
        </header>

        {/* Stats */}
        <div className='border-b-1 border-b-gray-200/10 lg:border-t-1 lg:border-t-gray-200/10'>
          <dl className='mx-auto grid max-w-7xl grid-cols-1 sm:grid-cols-2 lg:px-2 xl:grid-cols-4 xl:px-0'>
            <StatCardLayout
              accountType={account.account_type}
              interestRate={account.interest_rate}
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
              <DepositModalButton
                color='primary'
                size='sm'
                variant='ghost'
                startContent={<ArrowUpToLine size={16} />}
              />
              <WithdrawModalButton
                color='primary'
                size='sm'
                variant='ghost'
                startContent={<ArrowDownToLine size={16} />}
              />
              <TransferModalButton
                color='primary'
                size='sm'
                variant='ghost'
                startContent={<ArrowLeftRight size={16} />}
              />
            </div>
          </div>

          <div className='mt-6 overflow-hidden border-t-0 border-gray-100'>
            <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
              <div className='mx-auto max-w-2xl lg:mx-0 lg:max-w-none'>
                <DashboardTransactionsTable />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
