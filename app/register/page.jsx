'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@nextui-org/input';
import { Checkbox } from '@nextui-org/checkbox';
import { Link } from '@nextui-org/link';
import { Button } from '@nextui-org/button';

import RegisterLayout from '@/components/Layout/RegisterLayout';
import RegisterBrand from '@/components/Brand/RegisterBrand';
import PasswordVisibleButton from '@/components/Button/PasswordVisibleButton';
import Pages from '@/constants/Pages';
import APIs from '@/constants/APIs';

export default function Register() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [isUsernameInvalid, setIsUsernameInvalid] = useState(false);
  const [isPasswordInvalid, setIsPasswordInvalid] = useState(false);

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
      const res = await fetch(APIs.REGISTER, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        router.push(Pages.LOGIN);
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
          <Link size='md' underline='always' href={Pages.TOS}>
            Terms and Conditions
          </Link>
        </Checkbox>

        <Button
          color='primary'
          isLoading={isLoading}
          isDisabled={!acceptTerms}
          type='submit'
        >
          Sign Up
        </Button>
      </form>

      <p className='text-center text-small'>
        Already have an account?{' '}
        <Link size='sm' underline='always' href={Pages.LOGIN}>
          Log In
        </Link>
      </p>
    </RegisterLayout>
  );
}
