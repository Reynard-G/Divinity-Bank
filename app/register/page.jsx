'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@nextui-org/button';
import { Checkbox } from '@nextui-org/checkbox';
import { Input } from '@nextui-org/input';
import { Link } from '@nextui-org/link';

import RegisterBrand from '@/components/Brand/RegisterBrand';
import PasswordVisibleButton from '@/components/Button/PasswordVisibleButton';
import RegisterLayout from '@/components/Layout/RegisterLayout';
import Page from '@/constants/Page';
import { register } from '@/lib/actions/form.actions';

export default function Register() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [minecraftUsername, setMinecraftUsername] = useState('');
  const [discordUsername, setDiscordUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [isUsernameInvalid, setIsUsernameInvalid] = useState(false);
  const [isPasswordInvalid, setIsPasswordInvalid] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    setIsFormValid(
      minecraftUsername &&
        discordUsername &&
        password &&
        confirmPassword &&
        acceptTerms &&
        password === confirmPassword,
    );
  }, [
    minecraftUsername,
    discordUsername,
    password,
    confirmPassword,
    acceptTerms,
  ]);

  return (
    <RegisterLayout>
      <RegisterBrand />

      <form
        className='flex flex-col gap-3'
        action={async (formData) => {
          await register(formData).then((user) => {
            setIsLoading(false);
            if (user) {
              setIsUsernameInvalid(false);
              router.push(Page.DASHBOARD);
            } else {
              setIsUsernameInvalid(true);
            }
          });
        }}
        onSubmit={() => setIsLoading(true)}
      >
        <div className='flex flex-col'>
          <Input
            type='text'
            variant='bordered'
            name='minecraftUsername'
            label='Minecraft Username'
            placeholder='Enter your minecraft username'
            isInvalid={isUsernameInvalid}
            onValueChange={setMinecraftUsername}
            classNames={{
              base: '-mb-[2px]',
              inputWrapper:
                'rounded-b-none data-[hover=true]:z-10 group-data-[focus-visible=true]:z-10',
            }}
          />

          <Input
            type='text'
            variant='bordered'
            name='discordUsername'
            label='Discord Username'
            placeholder='Enter your discord username'
            onValueChange={setDiscordUsername}
            classNames={{
              base: '-mb-[2px]',
              inputWrapper:
                'rounded-none data-[hover=true]:z-10 group-data-[focus-visible=true]:z-10',
            }}
          />

          <Input
            type={isPasswordVisible ? 'text' : 'password'}
            variant='bordered'
            name='password'
            label='Password'
            placeholder='Enter your password'
            isInvalid={isPasswordInvalid}
            endContent={
              <PasswordVisibleButton
                isVisible={isPasswordVisible}
                setIsVisible={setIsPasswordVisible}
              />
            }
            onValueChange={(value) => {
              setPassword(value);
              setIsPasswordInvalid(
                !confirmPassword || confirmPassword !== value,
              );
            }}
            classNames={{
              base: '-mb-[2px]',
              inputWrapper:
                'rounded-none data-[hover=true]:z-10 group-data-[focus-visible=true]:z-10',
            }}
          />

          <Input
            type={isConfirmPasswordVisible ? 'text' : 'password'}
            variant='bordered'
            name='confirmPassword'
            label='Confirm Password'
            placeholder='Confirm your password'
            isInvalid={isPasswordInvalid}
            errorMessage={isPasswordInvalid && 'Passwords do not match'}
            endContent={
              <PasswordVisibleButton
                isVisible={isConfirmPasswordVisible}
                setIsVisible={setIsConfirmPasswordVisible}
              />
            }
            onValueChange={(value) => {
              setConfirmPassword(value);
              setIsPasswordInvalid(!password || password !== value);
            }}
            classNames={{
              inputWrapper: 'rounded-t-none',
            }}
          />
        </div>

        <Checkbox
          size='md'
          className='py-4'
          isSelected={acceptTerms}
          onValueChange={setAcceptTerms}
        >
          I agree with the{' '}
          <Link size='md' underline='always' href={Page.TOS}>
            Terms and Conditions
          </Link>
        </Checkbox>

        <Button
          color='primary'
          isLoading={isLoading}
          isDisabled={!isFormValid}
          type='submit'
        >
          Sign Up
        </Button>
      </form>

      <p className='text-center text-small'>
        Already have an account?{' '}
        <Link size='sm' underline='always' href={Page.LOGIN}>
          Log In
        </Link>
      </p>
    </RegisterLayout>
  );
}
