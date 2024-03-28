import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Avatar } from '@nextui-org/avatar';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@nextui-org/dropdown';
import useSWR from 'swr';

import API from '@/constants/API';
import Page from '@/constants/Page';
import { logout } from '@/lib/actions/form.actions';
import fetcher from '@/utils/fetcher';

export default function AvatarSettings({ minecraftUUID }) {
  const { data } = useSWR(API.USER, fetcher);
  const router = useRouter();
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (data) {
      setUsername(data?.minecraft_username || 'Unknown User');
    }
  }, [data]);

  return (
    <Dropdown>
      <DropdownTrigger>
        <Avatar
          as='button'
          showFallback
          isBordered
          radius='lg'
          name={username}
          src={`https://crafatar.com/avatars/${minecraftUUID}`}
          alt='Minecraft Avatar'
        />
      </DropdownTrigger>

      <DropdownMenu aria-label='Profile Actions' variant='faded'>
        <DropdownItem key='profile' textValue='Signed in as'>
          <p>Signed in as</p>
          <p className='font-bold'>{username}</p>
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
