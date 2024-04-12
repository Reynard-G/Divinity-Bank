import { spaceGrotesk } from '@/app/fonts';
import Providers from '@/app/providers';

import './globals.css';
import '@mantine/dropzone/styles.css';

export const metadata = {
  title: 'Divinity: Home',
  description: 'The official website for Divinity Bank.',
};

export default function RootLayout({ children }) {
  return (
    <html lang='en' className='dark'>
      <body className={spaceGrotesk.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
