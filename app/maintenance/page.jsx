import Image from 'next/image';

import { anta } from '@/app/fonts';
import cn from '@/utils/cn';

export default function Maintenance() {
  return (
    <div className='flex h-dvh w-full flex-col items-center justify-center gap-4 px-12 py-4 text-center sm:space-y-4 lg:space-y-8 lg:px-52 xl:px-96'>
      <Image src='/divinity.svg' width={150} height={64} alt='Divinity Logo' />
      <div className={cn('space-y-4', anta.className)}>
        <h1 className='text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold'>
          We&apos;ve got something cooking in the back.
        </h1>
        <p className='text-center text-md sm:text-lg lg:text-xl'>
          And we can&apos;t wait to show you what it is. Please check back soon.
        </p>
      </div>
    </div>
  );
}
