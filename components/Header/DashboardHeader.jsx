'use client';

import { useState } from 'react';

import { Button } from '@nextui-org/button';

import { useUserContext } from '@/contexts';

const timeFrameButtons = [
  { name: 'Last 7 days', value: 7 },
  { name: 'Last 30 days', value: 30 },
  { name: 'All-time', value: Infinity },
];

export default function DashboardHeader() {
  const { accountType } = useUserContext();
  const [selectedTimeFrame, setSelectedTimeFrame] = useState(
    timeFrameButtons[0].value,
  );

  return (
    <>
      <h1 className='text-base font-semibold leading-7 text-gray-200'>
        {accountType} Account
      </h1>
      <div className='order-last flex w-full gap-x-8 text-sm font-semibold leading-6 sm:order-none sm:w-auto sm:border-l sm:border-white/15 sm:pl-6 sm:leading-7'>
        {timeFrameButtons.map((button) => (
          <Button
            key={button.name}
            variant={selectedTimeFrame === button.value ? 'flat' : 'light'}
            size='sm'
            onClick={() => setSelectedTimeFrame(button.value)}
          >
            {button.name}
          </Button>
        ))}
      </div>
    </>
  );
}
