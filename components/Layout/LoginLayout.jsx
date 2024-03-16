export default function LoginLayout({ children }) {
  return (
    <div className='relative flex min-h-dvh flex-col bg-transparent'>
      <div className='flex h-screen items-center justify-center p-4'>
        <div className='flex h-full w-full items-center justify-center'>
          <div className='flex w-full max-w-sm flex-col gap-4'>{children}</div>
        </div>
      </div>
    </div>
  );
}
