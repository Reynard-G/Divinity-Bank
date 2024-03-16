import { Icon } from '@iconify/react';

import UserSidebar from '@/components/Sidebar/UserSidebar';
import AvatarSettings from '@/components/User/AvatarSettings';

export default function DashboardLayout({ children }) {
  const currentHour = new Date().getHours();
  let greetingText, greetingIcon;

  if (currentHour >= 5 && currentHour < 12) {
    greetingText = 'Good Morning!';
    greetingIcon = 'meteocons:fog-day-fill';
  } else if (currentHour >= 12 && currentHour < 18) {
    greetingText = 'Good Afternoon!';
    greetingIcon = 'meteocons:clear-day-fill';
  } else {
    greetingText = 'Good Night!';
    greetingIcon = 'meteocons:fog-night-fill';
  }

  return (
    <div className='flex h-screen items-center justify-center dark'>
      <div className='flex h-dvh w-full'>
        <div className='relative flex w-72 max-w-[288px] flex-1 flex-col bg-transparent'>
          <UserSidebar />
        </div>

        <div className='w-full flex-1 flex-col p-4'>
          <header className='flex justify-between gap-3 rounded-medium border-small border-divider px-4 py-3'>
            <h2 className='flex flex-row items-center gap-2 text-xl font-medium text-default-700'>
              {greetingText} <Icon icon={greetingIcon} fontSize='2rem' />
            </h2>

            <div className='flex flex-row items-center gap-2'>
              <AvatarSettings minecraftUUID='01e47070-8bfa-4666-b405-e9da208d626d' />
            </div>
          </header>

          <main className='mt-4 h-dvh w-full overflow-visible'>
            <div className='flex h-full w-full flex-col gap-4 rounded-medium border-small border-divider'>
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
