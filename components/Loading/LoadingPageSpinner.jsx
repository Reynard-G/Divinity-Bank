import { Spinner } from '@nextui-org/spinner';

export default function LoadingPageSpinner() {
  return (
    <div className='flex h-svh items-center justify-center'>
      <Spinner color='primary' />
    </div>
  );
}
