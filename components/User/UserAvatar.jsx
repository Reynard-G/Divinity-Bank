'use client';

import { Avatar } from '@nextui-org/avatar';

import crafatarURL from '@/utils/crafatarURL';

export default function UserAvatar({ minecraftUUID, radius, size, ...props }) {
  return (
    <Avatar radius={radius} src={crafatarURL(minecraftUUID, size)} {...props} />
  );
}
