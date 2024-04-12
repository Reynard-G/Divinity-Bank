'use client';

import { Avatar } from '@nextui-org/avatar';

import { useUserContext } from '@/contexts';
import crafatarURL from '@/utils/crafatarURL';

export default function UserAvatar({ radius, size, ...props }) {
  const { minecraftUUID } = useUserContext();

  return (
    <Avatar radius={radius} src={crafatarURL(minecraftUUID, size)} {...props} />
  );
}
