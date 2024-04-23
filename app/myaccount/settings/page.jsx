import { cookies } from 'next/headers';

import { Divider } from '@nextui-org/divider';
import { eq } from 'drizzle-orm';

import UpdateAccountInfoForm from '@/components/Form/UpdateAccountInfoForm';
import UpdatePasswordForm from '@/components/Form/UpdatePasswordForm';
import UserAvatar from '@/components/User/UserAvatar';
import PersonalAccountTypeView from '@/components/View/PersonalAccountTypeView';
import { users } from '@/drizzle/schema';
import { db } from '@/lib/db';
import getPayloadFromJWT from '@/utils/getPayloadFromJWT';

export const metadata = {
  title: 'Divinity: Settings',
  description: 'Manage your account settings and profile information.',
};

async function getUser() {
  const cookie = cookies().get('authorization')?.value;
  const id = (await getPayloadFromJWT(cookie))?.id;

  return (
    await db
      .select({
        minecraft_uuid: users.minecraftUuid,
        minecraft_username: users.minecraftUsername,
        discord_username: users.discordUsername,
      })
      .from(users)
      .where(eq(users.id, id))
  )[0];
}

export default async function Settings() {
  const { minecraft_uuid, minecraft_username, discord_username } =
    await getUser();

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
              minecraftUUID={minecraft_uuid}
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

                <UpdateAccountInfoForm
                  currentMinecraftUsername={minecraft_username}
                  currentDiscordUsername={discord_username}
                />
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
