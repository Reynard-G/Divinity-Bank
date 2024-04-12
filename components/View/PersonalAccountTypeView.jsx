'use client';

import AccountType from '@/constants/AccountType';
import { useUserContext } from '@/contexts';

export default function PersonalAccountTypeView({ children }) {
  const { accountType } = useUserContext();

  return <>{accountType === AccountType.PERSONAL && children}</>;
}
