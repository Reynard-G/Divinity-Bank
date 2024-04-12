'use client';

import { useState } from 'react';

import { Button } from '@nextui-org/button';
import { Input } from '@nextui-org/input';

import { useUserContext } from '@/contexts';
import { updateAccountInfo } from '@/lib/actions/form.actions';
import isValidDiscordUsername from '@/utils/isValidDiscordUsername';

export default function UpdateAccountInfoForm() {
  const {
    minecraftUsername,
    discordUsername,
    setMinecraftUsername,
    setDiscordUsername,
  } = useUserContext();
  const [isAccountUpdating, setIsAccountUpdating] = useState(false);

  return (
    <form
      action={async (formData) => {
        await updateAccountInfo(formData).then((user) => {
          if (user) setIsAccountUpdating(false);
        });
      }}
      onSubmit={() => setIsAccountUpdating(true)}
      className='flex flex-col gap-2'
    >
      <Input
        isDisabled={true}
        name='minecraftUsername'
        label='Minecraft Username'
        variant='bordered'
        description='Your Minecraft Username is used to verify your account.'
        value={minecraftUsername}
        onValueChange={setMinecraftUsername}
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
        isInvalid={
          discordUsername === '' || !isValidDiscordUsername(discordUsername)
        }
        onValueChange={setDiscordUsername}
        classNames={{
          description: 'text-default-600',
        }}
      />

      <div className='flex flex-row'>
        <Button
          type='submit'
          isLoading={isAccountUpdating}
          isDisabled={
            discordUsername === '' || !isValidDiscordUsername(discordUsername)
          }
          color='primary'
          variant='ghost'
        >
          Update Account
        </Button>
      </div>
    </form>
  );
}
