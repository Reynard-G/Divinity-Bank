import { Spinner } from '@nextui-org/spinner';

export default function LoadingPageSpinner() {
  return (
    <div className='flex h-svh w-full items-center justify-center'>
      <Spinner color='primary' />
    </div>
  );
}
