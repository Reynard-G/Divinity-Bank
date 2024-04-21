import { useRouter } from 'next/navigation';

import { Avatar } from '@nextui-org/avatar';
import { Button } from '@nextui-org/button';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@nextui-org/dropdown';

import Page from '@/constants/Page';
import { logout } from '@/lib/actions/form.actions';
import crafatarURL from '@/utils/crafatarURL';

export default function AvatarSettings({ minecraftUsername, minecraftUUID }) {
  const router = useRouter();

  return (
    <Dropdown>
      <DropdownTrigger>
        <Avatar
          as={Button}
          isIconOnly={true}
          showFallback={true}
          isBordered={true}
          radius='lg'
          name={minecraftUsername}
          src={crafatarURL(minecraftUUID, 40)}
          alt='Minecraft Avatar'
        />
      </DropdownTrigger>

      <DropdownMenu aria-label='Profile Actions' variant='faded'>
        <DropdownItem key='profile' textValue='Signed in as'>
          <p>Signed in as</p>
          <p className='font-bold'>{minecraftUsername}</p>
        </DropdownItem>
        <DropdownItem key='settings' href={Page.SETTINGS}>
          Settings
        </DropdownItem>
        <DropdownItem
          key='logout'
          onPress={async () => {
            await logout().then(() => {
              router.replace(Page.LOGIN);
            });
          }}
        >
          Logout
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
