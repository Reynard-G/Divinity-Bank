'use client';

import { Divider } from '@nextui-org/divider';

export default function Withdraw() {
  return (
    <div className='flex flex-col gap-4 p-6'>
      <div className='flex flex-col'>
        <h1 className='text-3xl font-bold'>Withdraw</h1>
        <p className='text-sm text-default-500'>
          Withdraw money from your account
        </p>
      </div>

      <Divider />
    </div>
  );
}
