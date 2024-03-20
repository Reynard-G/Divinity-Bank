'use client';

import { useEffect, useState } from 'react';

import { Icon } from '@iconify/react';
import { Avatar } from '@nextui-org/avatar';
import { Badge } from '@nextui-org/badge';
import { Button } from '@nextui-org/button';
import { Divider } from '@nextui-org/divider';
import { Input } from '@nextui-org/input';
import { Popover, PopoverContent, PopoverTrigger } from '@nextui-org/popover';
import { Link } from '@nextui-org/react';
import useSWR from 'swr';

import UserDashboardLayout from '@/components/Layout/UserDashboardLayout';
import LoadingSpinner from '@/components/Loading/LoadingSpinner';
import API from '@/constants/API';
import Page from '@/constants/Page';
import fetcher from '@/utils/fetcher';

export default function Settings() {
  const { data, isLoading, error } = useSWR(API.USER, fetcher);
  const [minecraftUsername, setMinecraftUsername] = useState('');
  const [minecraftUUID, setMinecraftUUID] = useState('');
  const [discordUsername, setDiscordUsername] = useState('');
  const [accountCreatedAt, setAccountCreatedAt] = useState('');
  const [accountUpdatedAt, setAccountUpdatedAt] = useState('');

  useEffect(() => {
    if (data) {
      setMinecraftUsername(data?.minecraft_username || 'Unknown User');
      setMinecraftUUID(data?.minecraft_uuid || 'Unknown UUID');
      setDiscordUsername(data?.discord_username || 'Unknown Username');

      const createdAt = data?.created_at
        ? new Date(data.created_at * 1000).toLocaleString()
        : 'Unknown Date';
      const updatedAt = data?.updated_at
        ? new Date(data.updated_at * 1000).toLocaleString()
        : 'Unknown Date';
      setAccountCreatedAt(createdAt);
      setAccountUpdatedAt(updatedAt);
    }
  }, [data]);

  return (
    <UserDashboardLayout>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className='flex flex-col'>
            <h1 className='text-3xl font-bold'>Settings</h1>
            <p className='text-sm text-default-500'>
              Manage your account settings and profile information
            </p>
          </div>

          <Divider />

          <div className='px-8 py-2'>
            <div className='flex flex-row items-center justify-start gap-4'>
              <Badge
                color='primary'
                shape='circle'
                placement='bottom-right'
                content={
                  <Popover placement='right' color='primary'>
                    <PopoverTrigger>
                      <Button
                        isIconOnly
                        size='sm'
                        variant='light'
                        radius='full'
                        className='p-0 text-primary-foreground'
                      >
                        <Icon icon='carbon:edit' />
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent>
                      <p className='text-small'>
                        Editing profile pictures is currently disabled
                      </p>
                    </PopoverContent>
                  </Popover>
                }
                classNames={{ badge: 'w-6 h-6' }}
              >
                <Avatar
                  size='lg'
                  radius='lg'
                  src={`https://crafatar.com/avatars/${minecraftUUID}`}
                />
              </Badge>

              <p className='text-lg font-bold'>{minecraftUsername}</p>
            </div>

            <div className='flex flex-col pt-2'>
              <p className='text-default-400'>
                This skin will be used for your profile and will be visible to
                other users.
              </p>
            </div>
          </div>

          <div className='flex flex-row gap-8 px-6'>
            <div className='flex w-full flex-col gap-4 lg:w-1/2'>
              <h2 className='text-xl font-bold'>Account Information</h2>

              <Input
                label='Minecraft Username'
                variant='bordered'
                description='Your minecraft username is used to identify your account. Do not change this unless you have to as you may be unable to receive funds.'
                value={minecraftUsername}
                onValueChange={setMinecraftUsername}
                classNames={{
                  description: 'text-default-600',
                }}
              />
              <Input
                isDisabled={true}
                label='Minecraft UUID'
                variant='bordered'
                description='Your minecraft UUID is used to verify your account with your username.'
                value={minecraftUUID}
                onValueChange={setMinecraftUUID}
                classNames={{
                  description: 'text-default-600',
                }}
              />
              <Input
                label='Discord Username'
                variant='bordered'
                value={discordUsername}
                description='Your discord username is used to verify your ownership when contacting support.'
                onValueChange={setDiscordUsername}
                classNames={{
                  description: 'text-default-600',
                }}
              />

              <div className='flex flex-row gap-2'>
                <Button
                  isDisabled={true}
                  isLoading={false}
                  color='primary'
                  variant='ghost'
                >
                  Update Account
                </Button>
              </div>
            </div>

            <div className='hidden lg:flex lg:w-1/2'>
              <div className='flex flex-col gap-1'>
                <p className='text-default-500'>
                  <span className='font-bold'>Created At:</span>{' '}
                  {accountCreatedAt}
                </p>
                <p className='text-default-500'>
                  <span className='font-bold'>Last Updated:</span>{' '}
                  {accountUpdatedAt}
                </p>
              </div>
            </div>
          </div>

          <div className='flex flex-row gap-8 px-6'>
            <div className='flex w-full flex-col gap-4 lg:w-1/2'>
              <h2 className='text-xl font-bold'>Change Password</h2>

              <Input
                type='password'
                variant='bordered'
                label='Current Password'
              />
              <Input type='password' variant='bordered' label='New Password' />
              <Input
                type='password'
                variant='bordered'
                label='Confirm New Password'
              />

              <div className='flex flex-row gap-2'>
                <Button
                  isDisabled={true}
                  isLoading={false}
                  color='primary'
                  variant='ghost'
                >
                  Update Password
                </Button>
                <Link
                  size='sm'
                  underline='hover'
                  href={Page.FORGOT_PASSWORD}
                  className='text-primary-500'
                >
                  I forgot my password
                </Link>
              </div>
            </div>

            <div className='hidden lg:flex lg:w-1/2'>
              {/*
                <h2 className='text-xl font-bold'>Make sure it's:</h2>
                
                <ul className="list-disc list-inside">
                  <li>At least 8 characters long</li>
                  <li>Contains at least one number</li>
                  <li>Contains at least one special character</li>
                  <li>Contains at least one uppercase letter</li>
                  <li>Contains at least one lowercase letter</li>}
                </ul>
                */}
              <p className='text-default-500'>
                We recommend using a password manager to generate and store a
                strong password. We may require you to change your password if
                we believe it has been compromised.
              </p>
            </div>
          </div>
        </>
      )}
    </UserDashboardLayout>
  );
}
