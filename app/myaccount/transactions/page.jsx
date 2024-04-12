import dynamic from 'next/dynamic';

import { Divider } from '@nextui-org/divider';

const TransactionsTable = dynamic(
  () => import('@/components/Table/TransactionsTable'),
);

export const metadata = {
  title: 'Divinity: Transactions',
  description: 'View details about your transaction history.',
};

export default function Transactions() {
  return (
    <div className='flex flex-col gap-4 p-6'>
      <div className='flex flex-col'>
        <h1 className='text-3xl font-bold'>Transactions</h1>
        <p className='text-sm text-default-500'>
          View details about your transaction history
        </p>
      </div>

      <Divider />

      <TransactionsTable />
    </div>
  );
}
