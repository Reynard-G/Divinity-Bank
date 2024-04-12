'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@nextui-org/button';
import { Input } from '@nextui-org/input';
import { Link } from '@nextui-org/link';

import Page from '@/constants/Page';
import { updatePassword } from '@/lib/actions/form.actions';

export default function UpdatePasswordForm() {
  const router = useRouter();
  const [isPasswordUpdating, setIsPasswordUpdating] = useState(false);
  const [isPasswordInvalid, setIsPasswordInvalid] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
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
        isInvalid={confirmPassword && newPassword !== confirmPassword}
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
  );
}
