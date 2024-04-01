'use client';

import { NextUIProvider } from '@nextui-org/react';

import { UserContextProvider } from '@/contexts/UserContext';

export default function Providers({ children }) {
  return (
    <UserContextProvider>
      <NextUIProvider>{children}</NextUIProvider>
    </UserContextProvider>
  );
}
