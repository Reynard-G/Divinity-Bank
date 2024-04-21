import { Divider } from '@nextui-org/divider';

import UpdateAccountInfoForm from '@/components/Form/UpdateAccountInfoForm';
import UpdatePasswordForm from '@/components/Form/UpdatePasswordForm';
import UserAvatar from '@/components/User/UserAvatar';
import PersonalAccountTypeView from '@/components/View/PersonalAccountTypeView';

export const metadata = {
  title: 'Divinity: Settings',
  description: 'Manage your account settings and profile information.',
};

export default function Settings() {
  return (
    <>
      <div className='p-6'>
        <div className='flex flex-col'>
          <h1 className='text-3xl font-bold'>Settings</h1>
          <p className='text-sm text-default-500'>
            Manage your account settings and profile information
          </p>
        </div>

        <Divider className='my-2' />

        <div className='flex flex-col lg:flex-row-reverse'>
          <div className='relative flex flex-row justify-center gap-4 lg:w-1/3'>
            <UserAvatar
              radius='lg'
              size={192}
              className='mb-12 h-48 w-48 lg:mt-12'
            />
          </div>

          <div className='flex flex-col lg:w-2/3'>
            {/* Show the account information form if on a personal account */}
            <PersonalAccountTypeView>
              <div className='mt-2 flex w-full flex-col gap-4'>
                <h2 className='text-xl font-bold'>Account Information</h2>

                <UpdateAccountInfoForm />
              </div>
            </PersonalAccountTypeView>

            <div className='mt-6 flex w-full flex-col gap-4'>
              <h2 className='text-xl font-bold'>Change Password</h2>

              <UpdatePasswordForm />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
