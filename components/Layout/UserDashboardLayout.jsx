import { useEffect, useState } from 'react';

import { Icon } from '@iconify/react';
import { Button } from '@nextui-org/button';
import { useDisclosure } from '@nextui-org/use-disclosure';
import useSWR from 'swr';

import SidebarDrawer from '@/components/Sidebar/SidebarDrawer';
import UserSidebar from '@/components/Sidebar/UserSidebar';
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
    const { text, icon } = greetingBasedOnTime();
    setGreetingText(text);
    setGreetingIcon(icon);
  }, []);

  useEffect(() => {
    if (data) {
      setMinecraftUUID(data?.minecraft_uuid);
    }
  }, [data]);

  return (
    <div className='flex h-screen items-center justify-center dark'>
      <div className='flex h-svh w-full'>
        <div className='relative hidden w-72 max-w-[288px] flex-1 flex-col bg-transparent sm:flex'>
          <UserSidebar />

          {isOpen && (
            <SidebarDrawer isOpen={isOpen} onOpenChange={onOpenChange} />
          )}
        </div>

        <div className='w-full flex-1 flex-col p-4'>
          <header className='flex items-center justify-between gap-3 rounded-medium border-small border-divider px-4 py-3'>
            <Button
              isIconOnly={true}
              size='sm'
              variant='light'
              onPress={onOpen}
              className='flex sm:hidden'
            >
              <Icon icon='lucide:menu' fontSize='1.5rem' />
            </Button>

            <h2 className='flex flex-row items-center gap-2 text-xl font-medium text-default-700'>
              {greetingText} <Icon icon={greetingIcon} fontSize='2rem' />
            </h2>

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
