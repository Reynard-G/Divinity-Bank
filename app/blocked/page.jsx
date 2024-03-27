export default function Blocked() {
  return (
    <div className='flex flex-col items-center justify-center h-dvh gap-4'>
      <h1 className='text-5xl font-bold animate-fade-down'>Woah!</h1>
      <p className='text-xl text-center animate-fade-up animate-delay-200 animate-duration-750'>
        You're asking a lot from me, why not take a breather for a second?
      </p>
    </div>
  );
}