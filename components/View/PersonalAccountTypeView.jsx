import { cookies } from 'next/headers';

import { eq } from 'drizzle-orm';

import AccountType from '@/constants/AccountType';
import { users } from '@/drizzle/schema';
import { db } from '@/lib/db';
import getPayloadFromJWT from '@/utils/getPayloadFromJWT';

async function getAccountType() {
  const cookie = cookies().get('authorization')?.value;
  const id = (await getPayloadFromJWT(cookie))?.id;

  return (
    await db
      .select({
        account_type: users.accountType,
      })
      .from(users)
      .where(eq(users.id, id))
  )[0]?.account_type;
}

export default async function PersonalAccountTypeView({ children }) {
  const accountType = await getAccountType();

  return <>{accountType === AccountType.PERSONAL && children}</>;
}
