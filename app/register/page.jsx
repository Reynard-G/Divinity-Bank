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
import API from '@/constants/API';
import Page from '@/constants/Page';

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

  async function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    // Check if password & confirm password fields match
    if (data.password !== data.confirmPassword) {
      setIsPasswordInvalid(true);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(API.REGISTER, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        router.push(Page.LOGIN);
      } else {
        setIsUsernameInvalid(true);
      }
    } catch (error) {
      console.error(error);
      // handle error
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    setIsFormValid(
      minecraftUsername &&
        discordUsername &&
        password &&
        confirmPassword &&
        acceptTerms,
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

      <form className='flex flex-col gap-3' onSubmit={handleSubmit}>
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
            onValueChange={setPassword}
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
            onValueChange={setConfirmPassword}
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
