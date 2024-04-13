import { Link } from '@nextui-org/link';
import { Spacer } from '@nextui-org/spacer';

import FooterBrand from '@/components/Brand/FooterBrand';
import DiscordIcon from '@/components/Icon/DiscordIcon';
import MinecraftIcon from '@/components/Icon/MinecraftIcon';
import Page from '@/constants/Page';

export default function DefaultFooter() {
  return (
    <footer className='flex w-full flex-col border-t-small border-divider'>
      <div className='mx-auto flex w-full max-w-7xl flex-col items-center justify-center px-6 py-12 lg:px-8'>
        <FooterBrand />

        <Spacer y={4} />

        <div className='flex flex-wrap justify-center gap-x-4 gap-y-1'>
          <Link href={Page.HOME} size='sm' className='text-default-500'>
            Home
          </Link>
          <Link href={Page.ABOUT} size='sm' className='text-default-500'>
            About
          </Link>
          <Link href={Page.FAQ} size='sm' className='text-default-500'>
            FAQ
          </Link>
        </div>

        <Spacer y={6} />

        <div className='flex justify-center gap-x-4'>
          <Link
            aria-label='Discord'
            isExternal
            href='discord.gg'
            className='text-default-400'
          >
            <DiscordIcon color='currentColor' width={20} height={20} />
          </Link>
          <Link
            aria-label='Minecraft'
            isExternal
            href='cityrp.org'
            className='text-default-400'
          >
            <MinecraftIcon color='currentColor' width={20} height={20} />
          </Link>
        </div>

        <Spacer y={4} />

        <p className='mt-1 text-center text-small text-default-400'>
          &copy; 2024 MilkLegend. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
