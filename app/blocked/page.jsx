'use client';

import { useState } from 'react';

const messages = [
  {
    title: 'Temporarily Blocked',
    message: 'You have exceeded the rate limit and are temporarily blocked.',
  },
  {
    title: 'Slow Down Partner',
    message: 'I know you are excited, but you need to slow down a bit.',
  },
  {
    title: 'Cooling Off Period',
    message:
      "It seems you're being a bit too enthusiastic. We've temporarily limited your access to prevent overloading our systems. Don't worry, you'll be able to continue shortly.",
  },
  {
    title: 'Whoa There!',
    message:
      "You're making too many requests at the moment. Let's give our servers a short break, and you can try again shortly.",
  },
  {
    title: 'Take a Break',
    message:
      "You've been working hard, but our servers need a little breather. Please take a short break, and we'll have you back in action soon.",
  },
  {
    title: 'Timeout for Throttling',
    message:
      "You've been sending us requests at an impressive rate, but we need to hit the brakes for a bit. Please hang tight, and we'll remove the throttle shortly.",
  },
];

export default function Blocked() {
  const [randomMessage] = useState(
    messages[Math.floor(Math.random() * messages.length)],
  );

  return (
    <div className='flex h-dvh w-full flex-col items-center justify-center gap-4 px-12 py-4 text-center lg:px-52 xl:px-96'>
      <div className='space-y-4'>
        <h1 className='break-words text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl'>
          {randomMessage.title}
        </h1>
        <p className='break-words text-gray-500 dark:text-gray-400 sm:text-lg md:text-xl'>
          {randomMessage.message}
        </p>
      </div>
    </div>
  );
}
