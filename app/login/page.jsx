'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@nextui-org/input';
import { Checkbox } from '@nextui-org/checkbox';
import { Link } from '@nextui-org/link';
import { Button } from '@nextui-org/button';

import LoginLayout from '@/components/Layout/LoginLayout';
import LoginBrand from '@/components/Brand/LoginBrand';
import PasswordVisibleButton from '@/components/Button/PasswordVisibleButton';
import Pages from '@/constants/Pages';
import APIs from '@/constants/APIs';

export default function Login() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isCredentialsInvalid, setIsCredentialsInvalid] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    // Prepare form data
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    setIsLoading(true);
    try {
      // Make API request
      const res = await fetch(APIs.LOGIN, {
        method: 'POST',
        body: JSON.stringify({ ...data, remember: rememberMe }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Handle response
      if (res.ok) {
        setIsCredentialsInvalid(false);
        router.push(Pages.DASHBOARD);
      } else {
        setIsCredentialsInvalid(true);
      }
    } catch (error) {
      console.error('Error during login:', error);
      // Handle error if needed
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    // If username and password are not empty, form is valid
    setIsFormValid(username && password);
  }, [username, password]);

  return (
    <LoginLayout>
      <LoginBrand />

      <form className='flex flex-col gap-3' onSubmit={handleSubmit}>
        <div className='flex flex-col'>
          <Input
            type='text'
            variant='bordered'
            name='username'
            label='Username'
            placeholder='Enter your username'
            isInvalid={isCredentialsInvalid}
            onValueChange={setUsername}
            classNames={{
              base: '-mb-[2px]',
              inputWrapper:
                'rounded-b-none data-[hover=true]:z-10 group-data-[focus-visible=true]:z-10',
            }}
          />

          <Input
            type={isPasswordVisible ? 'text' : 'password'}
            variant='bordered'
            name='password'
            label='Password'
            placeholder='Enter your password'
            isInvalid={isCredentialsInvalid}
            errorMessage={
              isCredentialsInvalid && 'Invalid username or password'
            }
            endContent={
              <PasswordVisibleButton
                isVisible={isPasswordVisible}
                setIsVisible={setIsPasswordVisible}
              />
            }
            onValueChange={setPassword}
            classNames={{
              inputWrapper: 'rounded-t-none',
            }}
          />
        </div>

        <div className='flex items-center justify-between'>
          <Checkbox
            name='remember me'
            size='md'
            isSelected={rememberMe}
            onValueChange={setRememberMe}
          >
            Remember me
          </Checkbox>

          <Link size='sm' underline='always' href={Pages.FORGOT_PASSWORD}>
            Forgot Password?
          </Link>
        </div>

        <Button
          isDisabled={!isFormValid}
          color='primary'
          isLoading={isLoading}
          type='submit'
        >
          Log In
        </Button>
      </form>

      <p className='text-center text-small'>
        Need to create an account?{' '}
        <Link size='sm' underline='always' href={Pages.REGISTER}>
          Sign Up
        </Link>
      </p>
    </LoginLayout>
  );
}
