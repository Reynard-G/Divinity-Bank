'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

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
import { updateAccountInfo, updatePassword } from '@/lib/actions/form.actions';
import fetcher from '@/utils/fetcher';

export default function Settings() {
  const { data, isLoading, mutate } = useSWR(API.USER, fetcher);
  const router = useRouter();
  const [isAccountUpdating, setIsAccountUpdating] = useState(false);
  const [isPasswordUpdating, setIsPasswordUpdating] = useState(false);
  const [isPasswordInvalid, setIsPasswordInvalid] = useState(false);
  const [minecraftUUID, setMinecraftUUID] = useState('');
  const [discordUsername, setDiscordUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (data) {
      setMinecraftUUID(data?.minecraft_uuid);
      setDiscordUsername(data?.discord_username);
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

            <div className='flex flex-col lg:w-2/3'>
              <div className='mt-2 flex w-full flex-col gap-4'>
                <h2 className='text-xl font-bold'>Account Information</h2>

                <form
                  action={async (formData) => {
                    await updateAccountInfo(formData).then((user) => {
                      if (user) {
                        setIsAccountUpdating(false);
                        setDiscordUsername(user.discord_username);
                        mutate({
                          ...data,
                          discord_username: user.discord_username,
                        });
                      }
                    });
                  }}
                  onSubmit={() => setIsAccountUpdating(true)}
                  className='flex flex-col gap-2'
                >
                  <Input
                    isDisabled={true}
                    name='minecraftUUID'
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
                    name='discordUsername'
                    label='Discord Username'
                    variant='bordered'
                    value={discordUsername}
                    description='Your discord username is used to verify your ownership when contacting support.'
                    onValueChange={setDiscordUsername}
                    classNames={{
                      description: 'text-default-600',
                    }}
                  />

                  <div className='flex flex-row'>
                    <Button
                      type='submit'
                      isDisabled={
                        minecraftUUID === data?.minecraft_uuid &&
                        discordUsername === data?.discord_username
                      }
                      isLoading={isAccountUpdating}
                      color='primary'
                      variant='ghost'
                    >
                      Update Account
                    </Button>
                  </div>
                </form>
              </div>

              <div className='mt-6 flex w-full flex-col gap-4'>
                <h2 className='text-xl font-bold'>Change Password</h2>

                <form
                  action={async (formData) => {
                    await updatePassword(formData).then((success) => {
                      if (success) {
                        router.replace(Page.LOGIN);
                      } else {
                        setIsPasswordInvalid(true);
                      }
                      setIsPasswordUpdating(false);
                    });
                  }}
                  onSubmit={() => setIsPasswordUpdating(true)}
                  className='flex flex-col gap-2'
                >
                  <Input
                    type='password'
                    variant='bordered'
                    label='Current Password'
                    name='currentPassword'
                    value={currentPassword}
                    isInvalid={isPasswordInvalid}
                    errorMessage={isPasswordInvalid && 'Invalid password'}
                    onValueChange={(value) => {
                      setCurrentPassword(value);
                      setIsPasswordInvalid(false);
                    }}
                  />
                  <Input
                    type='password'
                    variant='bordered'
                    name='newPassword'
                    label='New Password'
                    value={newPassword}
                    onValueChange={setNewPassword}
                  />
                  <Input
                    type='password'
                    variant='bordered'
                    name='confirmPassword'
                    label='Confirm New Password'
                    value={confirmPassword}
                    isInvalid={confirmPassword && (newPassword !== confirmPassword)}
                    errorMessage={
                      confirmPassword &&
                      newPassword !== confirmPassword &&
                      'Passwords do not match'
                    }
                    onValueChange={setConfirmPassword}
                  />

                  <div className='flex flex-row gap-2'>
                    <Button
                      type='submit'
                      isDisabled={
                        currentPassword === '' ||
                        newPassword === '' ||
                        confirmPassword === '' ||
                        newPassword !== confirmPassword
                      }
                      isLoading={isPasswordUpdating}
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
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </UserDashboardLayout >
  );
}
