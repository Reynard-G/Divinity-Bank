import { useRouter } from 'next/navigation';

import { Button } from '@nextui-org/button';
import { ScrollShadow } from '@nextui-org/scroll-shadow';
import { LogOut } from 'lucide-react';

import SidebarBrand from '@/components/Brand/SidebarBrand';
import SidebarItems from '@/components/Sidebar/SidebarItems';
import Page from '@/constants/Page';
import { logout } from '@/lib/actions/form.actions';

export default function SidebarCanvas({ items = [] }) {
  const router = useRouter();

  return (
    <div className='fixed flex h-full w-72 flex-col !border-r-small border-divider p-6'>
      <SidebarBrand />

      <ScrollShadow className='max-h-full flex-1 py-[10vh]'>
        <SidebarItems items={items} />
      </ScrollShadow>

      <div className='mt-auto flex flex-col justify-end'>
        <Button
          variant='light'
          startContent={<LogOut size={20} />}
          className='justify-start text-lg font-medium text-default-500 data-[hover=true]:text-foreground'
          onPress={async () => {
            await logout().then(() => {
              router.replace(Page.LOGIN);
            });
          }}
        >
          Logout
        </Button>
      </div>
    </div>
  );
}
