import { Link } from '@nextui-org/link';

import RegisterBrand from '@/components/Brand/RegisterBrand';
import RegisterForm from '@/components/Form/RegisterForm';
import RegisterLayout from '@/components/Layout/RegisterLayout';
import Page from '@/constants/Page';

export const metadata = {
  title: 'Divinity: Register',
  description: 'Start your journey with Divinity by creating an account.',
};

export default function Register() {
  return (
    <RegisterLayout>
      <RegisterBrand />

      <RegisterForm />

      <p className='text-center text-small'>
        Already have an account?{' '}
        <Link size='sm' underline='always' href={Page.LOGIN}>
          Log In
        </Link>
      </p>
    </RegisterLayout>
  );
}
