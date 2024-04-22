'use client';

import { Button } from '@nextui-org/button';
import { useDisclosure } from '@nextui-org/use-disclosure';
import { Menu } from 'lucide-react';

import DesktopUserSidebar from '@/components/Sidebar/DesktopUserSidebar';
import MobileUserSidebar from '@/components/Sidebar/MobileUserSidebar';
import AvatarSettings from '@/components/User/AvatarSettings';
import DashboardGreeting from '@/components/User/DashboardGreeting';

export default function DashboardLayout({ minecraftUser, children }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure(false);

  return (
    <div className='flex items-center justify-center'>
      <div className='flex w-full'>
        {/* Sidebar (CSS will handle the visibility based on screen size) */}
        <DesktopUserSidebar />
        <MobileUserSidebar isOpen={isOpen} onOpenChange={onOpenChange} />

        <div className='w-full flex-1 flex-col p-4'>
          <header className='flex animate-[fadeIn_300ms_ease-in-out] items-center justify-between gap-3 rounded-medium border-small border-divider px-4 py-3'>
            <Button
              aria-label={isOpen ? 'Close Sidebar' : 'Open Sidebar'}
              isIconOnly={true}
              size='sm'
              variant='light'
              onPress={onOpen}
              className='flex md:hidden'
            >
              <Menu size={20} />
            </Button>

            <DashboardGreeting />

            <div className='flex flex-row items-center gap-2'>
              <AvatarSettings
                minecraftUsername={minecraftUser.minecraft_username}
                minecraftUUID={minecraftUser.minecraft_uuid}
              />
            </div>
          </header>

          <main className='mt-4 w-full animate-[fadeIn_600ms_ease-in-out] overflow-visible'>
            <div className='w-full rounded-medium border-small border-divider'>
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
