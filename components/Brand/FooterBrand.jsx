import { chakraPetch } from '@/app/fonts';
import DivinityIcon from '@/components/Icon/DivinityIcon';
import cn from '@/utils/cn';

export default function FooterBrand() {
  return (
    <div className='flex items-center justify-center'>
      <DivinityIcon className='m-2' width={48} height={20} />
      <p className={cn('text-medium font-bold', chakraPetch.className)}>
        DIVINITY
      </p>
    </div>
  );
}
