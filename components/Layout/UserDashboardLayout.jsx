import { useEffect, useState } from 'react';

import { Button } from '@nextui-org/button';
import { useDisclosure } from '@nextui-org/use-disclosure';
import { Menu } from 'lucide-react';
import useSWR from 'swr';

import DesktopUserSidebar from '@/components/Sidebar/DesktopUserSidebar';
import MobileUserSidebar from '@/components/Sidebar/MobileUserSidebar';
import AvatarSettings from '@/components/User/AvatarSettings';
import API from '@/constants/API';
import fetcher from '@/utils/fetcher';
import greetingBasedOnTime from '@/utils/greetingBasedOnTime';

export default function DashboardLayout({ children }) {
  const { data } = useSWR(API.USER, fetcher);
  const { isOpen, onOpen, onOpenChange } = useDisclosure(false);
  const [minecraftUUID, setMinecraftUUID] = useState('');
  const [greetingText, setGreetingText] = useState('');
  const [greetingIcon, setGreetingIcon] = useState('');

  useEffect(() => {
    if (data) {
      setMinecraftUUID(data?.minecraft_uuid);

      const { text, icon } = greetingBasedOnTime(data?.minecraft_username);
      setGreetingText(text);
      setGreetingIcon(icon);
    }
  }, [data]);

  return (
    <div className='flex h-screen items-center justify-center'>
      <div className='flex h-svh w-full'>
        {/* Sidebar (CSS will handle the visibility based on screen size) */}
        <DesktopUserSidebar />
        <MobileUserSidebar isOpen={isOpen} onOpenChange={onOpenChange} />

        <div className='w-full flex-1 flex-col p-4'>
          <header className='flex items-center justify-between gap-3 rounded-medium border-small border-divider px-4 py-3'>
            <Button
              isIconOnly={true}
              size='sm'
              variant='light'
              onPress={onOpen}
              className='flex md:hidden'
            >
              <Menu size={20} />
            </Button>

            <div className='flex flex-row items-center gap-2'>
              <h2 className='text-sm font-medium text-default-700 md:text-base lg:text-xl'>
                {greetingText}
              </h2>
              {greetingIcon}
            </div>

            <div className='flex flex-row items-center gap-2'>
              <AvatarSettings minecraftUUID={minecraftUUID} />
            </div>
          </header>

          <main className='mt-4 w-full overflow-visible'>
            <div className='flex w-full flex-col gap-4 rounded-medium border-small border-divider p-4'>
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
