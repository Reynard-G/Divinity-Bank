import { Image } from '@nextui-org/image';

import { chakraPetch } from '@/app/fonts';
import cn from '@/utils/cn';

export default function FooterBrand() {
  return (
    <div className='flex items-center justify-center'>
      <Image
        src='/divinity.svg'
        height={0}
        width={0}
        style={{ width: '48px', height: 'auto' }}
        alt='Divinity'
        className='m-2 rounded-none'
      />
      <p className={cn('text-medium font-bold', chakraPetch.className)}>
        DIVINITY
      </p>
    </div>
  );
}
