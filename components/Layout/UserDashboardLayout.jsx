'use client';

import { Button } from '@nextui-org/button';
import { useDisclosure } from '@nextui-org/use-disclosure';
import { Menu } from 'lucide-react';
import useSWR from 'swr';

import LoadingComponentSpinner from '@/components/Loading/LoadingComponentSpinner';
import DesktopUserSidebar from '@/components/Sidebar/DesktopUserSidebar';
import MobileUserSidebar from '@/components/Sidebar/MobileUserSidebar';
import AvatarSettings from '@/components/User/AvatarSettings';
import DashboardGreeting from '@/components/User/DashboardGreeting';
import API from '@/constants/API';
import { useUserContext } from '@/contexts';
import fetcher from '@/utils/fetcher';

export default function DashboardLayout({ children }) {
  const {
    minecraftUsername,
    minecraftUUID,
    setUserId,
    setAccountType,
    setMinecraftUsername,
    setMinecraftUUID,
    setDiscordUsername,
    setInterestRate,
    setTransactionFee,
    setCreatedAt,
    setUpdatedAt,
  } = useUserContext();
  const { isLoading } = useSWR(API.USER, fetcher, {
    onSuccess: (data) => {
      setUserId(data?.id);
      setAccountType(data?.account_type);
      setMinecraftUsername(data?.minecraft_username);
      setMinecraftUUID(data?.minecraft_uuid);
      setDiscordUsername(data?.discord_username);
      setInterestRate(data?.interest_rate);
      setTransactionFee(data?.transaction_fee);
      setCreatedAt(data?.created_at);
      setUpdatedAt(data?.updated_at);
    },
  });
  const { isOpen, onOpen, onOpenChange } = useDisclosure(false);

  return (
    <div className='flex h-svh items-center justify-center'>
      <div className='flex h-full w-full'>
        {/* Sidebar (CSS will handle the visibility based on screen size) */}
        <DesktopUserSidebar />
        <MobileUserSidebar isOpen={isOpen} onOpenChange={onOpenChange} />

        {isLoading ? (
          <LoadingComponentSpinner />
        ) : (
          <div className='w-full flex-1 flex-col p-4'>
            <header className='flex items-center justify-between gap-3 rounded-medium border-small border-divider px-4 py-3'>
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
                  minecraftUsername={minecraftUsername}
                  minecraftUUID={minecraftUUID}
                />
              </div>
            </header>

            <main className='mt-4 w-full overflow-visible'>
              <div className='w-full rounded-medium border-small border-divider'>
                {children}
              </div>
            </main>
          </div>
        )}
      </div>
    </div>
  );
}
