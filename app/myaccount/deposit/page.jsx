'use client';

import { Divider } from '@nextui-org/divider';

export default function Deposit() {
  return (
    <div className='flex flex-col gap-4 p-6'>
      <div className='flex flex-col'>
        <h1 className='text-3xl font-bold'>Deposit</h1>
        <p className='text-sm text-default-500'>
          Deposit money into your account
        </p>
      </div>

      <Divider />
    </div>
  );
}
