'use client';

import { createTheme, MantineProvider } from '@mantine/core';
import { NextUIProvider } from '@nextui-org/react';

const theme = createTheme({
  colorScheme: 'dark',
});

export default function Providers({ children }) {
  return (
    <NextUIProvider>
      <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
        {children}
      </MantineProvider>
    </NextUIProvider>
  );
}
