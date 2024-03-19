'use client';

import UserDashboardLayout from '@/components/Layout/UserDashboardLayout';

export default function Dashboard() {
  return (
    <>
      <UserDashboardLayout>
        <div className='flex flex-col gap-4'>
          <h1 className='text-3xl font-bold'>Dashboard</h1>
          <p className='text-lg'>Welcome to the dashboard.</p>
        </div>
      </UserDashboardLayout>
    </>
  );
}
