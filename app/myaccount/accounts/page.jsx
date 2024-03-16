'use client';

import UserDashboardLayout from '@/components/Layout/UserDashboardLayout';

export default function Accounts() {
  return (
    <>
      <UserDashboardLayout>
        <div className='flex flex-col gap-4 p-4'>
          <h1 className='text-3xl font-bold'>Accounts</h1>
        </div>
      </UserDashboardLayout>
    </>
  );
}
