import { Spinner } from '@nextui-org/spinner';

export default function LoadingComponentSpinner() {
  return (
    <div className='flex h-full w-full items-center justify-center'>
      <Spinner color='primary' />
    </div>
  );
}
