'use client';

import { UserContextProvider } from '@/contexts/UserContext';

export default function Providers({ children }) {
  return <UserContextProvider>{children}</UserContextProvider>;
}
