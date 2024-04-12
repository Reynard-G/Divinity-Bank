'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@nextui-org/button';
import { Checkbox } from '@nextui-org/checkbox';
import { Input } from '@nextui-org/input';
import { Link } from '@nextui-org/link';

import PasswordVisibleButton from '@/components/Button/PasswordVisibleButton';
import Page from '@/constants/Page';
import { login } from '@/lib/actions/form.actions';

export default function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isCredentialsInvalid, setIsCredentialsInvalid] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    setIsFormValid(username && password);
  }, [username, password]);

  return (
    <form
      className='flex flex-col gap-3'
      action={async (formData) => {
        await login(formData).then((user) => {
          setIsLoading(false);
          if (user) {
            setIsCredentialsInvalid(false);
            router.push(Page.DASHBOARD);
          } else {
            setIsCredentialsInvalid(true);
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
          placeholder='Enter your username'
          isInvalid={isCredentialsInvalid}
          onValueChange={(value) => {
            setUsername(value);
            setIsCredentialsInvalid(false);
          }}
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
          errorMessage={isCredentialsInvalid && 'Invalid username or password'}
          endContent={
            <PasswordVisibleButton
              isVisible={isPasswordVisible}
              setIsVisible={setIsPasswordVisible}
            />
          }
          onValueChange={(value) => {
            setPassword(value);
            setIsCredentialsInvalid(false);
          }}
          classNames={{
            inputWrapper: 'rounded-t-none',
          }}
        />
      </div>

      <div className='flex items-center justify-between'>
        <Checkbox
          name='remember'
          value={rememberMe}
          size='md'
          isSelected={rememberMe}
          onValueChange={setRememberMe}
        >
          Remember me
        </Checkbox>

        <Link size='sm' underline='always' href={Page.FORGOT_PASSWORD}>
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
  );
}
