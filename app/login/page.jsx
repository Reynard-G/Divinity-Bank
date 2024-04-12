import { Link } from '@nextui-org/link';

import LoginBrand from '@/components/Brand/LoginBrand';
import LoginForm from '@/components/Form/LoginForm';
import LoginLayout from '@/components/Layout/LoginLayout';
import Page from '@/constants/Page';

export const metadata = {
  title: 'Divinity: Login',
  description: 'Securely log in to your Divinity account.',
};

export default function Login() {
  return (
    <LoginLayout>
      <LoginBrand />

      <LoginForm />

      <p className='text-center text-small'>
        Need to create an account?{' '}
        <Link size='sm' underline='always' href={Page.REGISTER}>
          Sign Up
        </Link>
      </p>
    </LoginLayout>
  );
}
