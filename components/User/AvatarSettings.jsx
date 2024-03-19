import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { Avatar } from '@nextui-org/avatar';
import {
  Dropdown,
  DropdownMenu,
  DropdownItem,
  DropdownTrigger,
} from '@nextui-org/dropdown';

import fetcher from '@/utils/fetcher';
import Pages from '@/constants/Pages';
import APIs from '@/constants/APIs';

export default function AvatarSettings({ minecraftUUID }) {
  const { data, error } = useSWR(APIs.USER, fetcher);
  const router = useRouter();
  const [username, setUsername] = useState('Loading...');

  const handleLogout = async () => {
    try {
      const res = await fetch(APIs.LOGOUT, {
        method: 'POST',
      });

      if (res.ok) {
        router.replace(Pages.LOGIN);
      } else {
        console.error('An error occurred during logout');
      }
    } catch (error) {
      console.error('An error occurred during logout:', error);
    }
  };

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
        <DropdownItem key='settings' href={Pages.SETTINGS}>
          Settings
        </DropdownItem>
        <DropdownItem key='logout' onPress={handleLogout}>
          Logout
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
