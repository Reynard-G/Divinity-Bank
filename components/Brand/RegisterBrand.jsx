import Image from 'next/image';

export default function RegisterBrand() {
  return (
    <div className='flex flex-col items-center pb-6'>
      <Image
        priority
        src='/divinity.svg'
        height={0}
        width={0}
        style={{ width: '60px', height: 'auto' }}
        alt='Divinity'
        className='m-4'
      />
      <p className='text-xl font-medium'>Welcome</p>
      <p className='text-small text-default-500'>
        Create an account to get started
      </p>
    </div>
  );
}
