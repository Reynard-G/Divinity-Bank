import { anta } from '@/app/fonts';
import RandomBlockedMessage from '@/components/User/RandomBlockedMessage';
import cn from '@/utils/cn';

export const metadata = {
  title: 'Divinity: Blocked',
  description: 'You have been temporarily blocked from accessing this page.',
};

export default function Blocked() {
  return (
    <div className='flex h-dvh w-full flex-col items-center justify-center gap-4 px-12 py-4 text-center lg:px-52 xl:px-96'>
      <div className={cn('space-y-4', anta.className)}>
        <RandomBlockedMessage />
      </div>
    </div>
  );
}
