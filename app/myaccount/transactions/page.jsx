'use client';

import UserDashboardLayout from '@/components/Layout/UserDashboardLayout';

export default function Transactions() {
  return (
    <>
      <UserDashboardLayout>
        <div className='flex flex-col gap-4'>
          <h1 className='text-3xl font-bold'>Transactions</h1>
        </div>
      </UserDashboardLayout>
    </>
  );
}
