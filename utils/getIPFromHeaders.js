import { headers } from 'next/headers';

export default function getIPFromHeaders() {
  if (headers().has('cf-connecting-ip')) {
    return headers().get('cf-connecting-ip');
  }

  if (headers().has('x-real-ip')) {
    return headers().get('x-real-ip');
  }

  if (headers().has('x-forwarded-for')) {
    return headers().get('x-forwarded-for').split(', ')[0];
  }

  // If no IP is found, return localhost
  return '127.0.0.1';
}
