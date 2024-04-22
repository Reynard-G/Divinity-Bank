import { cookies } from 'next/headers';

import { eq } from 'drizzle-orm';

import Providers from '@/app/myaccount/providers';
import UserDashboardLayout from '@/components/Layout/UserDashboardLayout';
import { accountTypes, users } from '@/drizzle/schema';
import { db } from '@/lib/db';
import getPayloadFromJWT from '@/utils/getPayloadFromJWT';

export const metadata = {
  title: 'Divinity: My Account',
  description: 'Manage your account settings, transactions, and more.',
};

async function getUserMinecraftDetails() {
  const cookie = cookies().get('authorization')?.value;
  const id = (await getPayloadFromJWT(cookie))?.id;

  return (
    await db
      .select({
        minecraft_uuid: users.minecraftUuid,
        minecraft_username: users.minecraftUsername,
      })
      .from(users)
      .leftJoin(accountTypes, eq(users.accountType, accountTypes.name))
      .where(eq(users.id, id))
  )[0];
}

export default async function MyAccountLayout({ children }) {
  const minecraftUser = await getUserMinecraftDetails();

  return (
    <Providers>
      <UserDashboardLayout minecraftUser={minecraftUser}>
        {children}
      </UserDashboardLayout>
    </Providers>
  );
}
