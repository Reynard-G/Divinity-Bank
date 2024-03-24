'use client';

import { useEffect, useState } from 'react';

import { Avatar } from '@nextui-org/avatar';
import { Button } from '@nextui-org/button';
import { Divider } from '@nextui-org/divider';
import { Input } from '@nextui-org/input';
import { Link } from '@nextui-org/react';
import useSWR from 'swr';

import UserDashboardLayout from '@/components/Layout/UserDashboardLayout';
import LoadingSpinner from '@/components/Loading/LoadingSpinner';
import API from '@/constants/API';
import Page from '@/constants/Page';
import fetcher from '@/utils/fetcher';

export default function Settings() {
  const { data, isLoading, error } = useSWR(API.USER, fetcher);
  const [minecraftUUID, setMinecraftUUID] = useState('');
  const [discordUsername, setDiscordUsername] = useState('');
  const [accountCreatedAt, setAccountCreatedAt] = useState('');
  const [accountUpdatedAt, setAccountUpdatedAt] = useState('');

  useEffect(() => {
    if (data) {
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

          <div className='flex flex-col lg:flex-row-reverse'>
            <div className='relative flex flex-row justify-center gap-4 lg:w-1/3'>
              <Avatar
                radius='lg'
                src={`https://crafatar.com/avatars/${minecraftUUID}`}
                className='mb-12 h-48 w-48 lg:mt-12'
              />
            </div>

            <div className='flex flex-col gap-8 lg:w-2/3'>
              <div className='flex flex-row gap-8 '>
                <div className='flex w-full flex-col gap-4'>
                  <h2 className='text-xl font-bold'>Account Information</h2>

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
              </div>

              <div className='flex flex-row gap-8'>
                <div className='flex w-full flex-col gap-4'>
                  <h2 className='text-xl font-bold'>Change Password</h2>

                  <Input
                    type='password'
                    variant='bordered'
                    label='Current Password'
                  />
                  <Input
                    type='password'
                    variant='bordered'
                    label='New Password'
                  />
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
              </div>
            </div>
          </div>
        </>
      )}
    </UserDashboardLayout>
  );
}
