import { headers } from 'next/headers';

export default function getIPFromHeaders() {
  const fallbackIP = '127.0.0.1';
  const forwardedFor = headers().get('x-forwarded-for');

  if (forwardedFor) {
    return forwardedFor.split(', ')[0] ?? fallbackIP;
  }

  return headers().get('x-real-ip') ?? fallbackIP;
}
