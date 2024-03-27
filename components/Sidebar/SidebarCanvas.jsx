import { useRouter } from 'next/navigation';

import { Icon } from '@iconify/react';
import { Button } from '@nextui-org/button';
import { ScrollShadow } from '@nextui-org/scroll-shadow';

import SidebarBrand from '@/components/Brand/SidebarBrand';
import SidebarItems from '@/components/Sidebar/SidebarItems';
import API from '@/constants/API';
import Page from '@/constants/Page';

export default function SidebarCanvas({ items = [] }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch(API.LOGOUT, {
        method: 'POST',
      });

      if (res.ok) router.replace(Page.LOGIN);
    } catch (error) {
      console.error('An error occurred during logout:', error);
    }
  };

  return (
    <div className='fixed flex h-full w-full max-w-[288px] flex-1 flex-col border-r-small border-divider p-6'>
      <SidebarBrand />

      <ScrollShadow className='max-h-full flex-1 py-[10vh]'>
        <SidebarItems items={items} />
      </ScrollShadow>

      <div className='mt-auto flex flex-col justify-end'>
        <Button
          variant='light'
          startContent={<Icon icon='ic:baseline-discord' fontSize='1.5rem' />}
          className='justify-start text-lg font-medium text-default-500 data-[hover=true]:text-foreground'
        >
          Discord
        </Button>
        <Button
          variant='light'
          startContent={<Icon icon='ic:round-logout' fontSize='1.5rem' />}
          className='justify-start text-lg font-medium text-default-500 data-[hover=true]:text-foreground'
          onPress={handleLogout}
        >
          Logout
        </Button>
      </div>
    </div>
  );
}
