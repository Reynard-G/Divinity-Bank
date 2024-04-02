//import { spaceGrotesk } from "@/app/fonts";
import { Space_Grotesk } from 'next/font/google';

import Providers from '@/app/providers';

import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
});

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
