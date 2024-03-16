import Image from 'next/image';
import { Link } from '@nextui-org/link';

import { chakraPetch } from '@/app/fonts';
import cn from '@/utils/cn';

export default function SidebarBrand() {
  return (
    <Link href='/'>
      <div className='flex items-center gap-2 px-2'>
        <div className='flex w-12'>
          <Image
            priority
            src='/divinity.svg'
            height={0}
            width={0}
            style={{ width: '48px', height: 'auto' }}
            alt='Divinity'
          />
        </div>
        <p
          className={cn('text-2xl font-bold uppercase', chakraPetch.className)}
        >
          Divinity
        </p>
      </div>
    </Link>
  );
}
