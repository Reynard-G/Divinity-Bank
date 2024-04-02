import { Button } from '@nextui-org/button';
import { Link } from '@nextui-org/link';
import { ArrowRight } from 'lucide-react';

import Page from '@/constants/Page';

export default function NotFound() {
  return (
    <main className='grid h-svh place-items-center px-6 py-24 sm:py-32 lg:px-8'>
      <div className='text-center'>
        <p className='text-base font-semibold'>404</p>
        <h1 className='mt-4 text-3xl font-bold tracking-tight text-gray-200 sm:text-5xl'>
          Page not found
        </h1>
        <p className='mt-6 text-base leading-7 text-gray-400'>
          Sorry, we couldn&apos;t find the page you&apos;re looking for.
        </p>
        <div className='mt-10 flex items-center justify-center gap-x-6'>
          <Button
            as={Link}
            href={Page.HOME}
            variant='shadow'
            radius='sm'
            color='primary'
          >
            Go back home
          </Button>
          <Button
            as={Link}
            href={Page.LOGIN}
            variant='light'
            radius='sm'
            color='primary'
            endContent={<ArrowRight size={16} />}
          >
            Log in
          </Button>
        </div>
      </div>
    </main>
  );
}
