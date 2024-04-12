import RandomBlockedMessage from '@/components/User/RandomBlockedMessage';

export const metadata = {
  title: 'Divinity: Blocked',
  description: 'You have been temporarily blocked from accessing this page.',
};

export default function Blocked() {
  return (
    <div className='flex h-dvh w-full flex-col items-center justify-center gap-4 px-12 py-4 text-center lg:px-52 xl:px-96'>
      <div className='space-y-4'>
        <RandomBlockedMessage />
      </div>
    </div>
  );
}
