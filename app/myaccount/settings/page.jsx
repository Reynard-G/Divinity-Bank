'use client';

import { Divider } from '@nextui-org/divider';

import UserDashboardLayout from '@/components/Layout/UserDashboardLayout';

export default function Settings() {
  return (
    <>
      <UserDashboardLayout>
        <div className='flex flex-col p-4'>
          <h1 className='text-3xl font-bold'>Account Settings</h1>
          <p className='text-sm text-default-500'>Manage your account settings</p>
        </div>

        <Divider />

        <div>
          
        </div>
      </UserDashboardLayout>
    </>
  );
}