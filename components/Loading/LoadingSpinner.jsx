import { Spinner } from '@nextui-org/spinner';

export default function LoadingSpinner() {
  return (
    <div className='flex h-full items-center justify-center'>
      <Spinner color='primary' />
    </div>
  );
}
