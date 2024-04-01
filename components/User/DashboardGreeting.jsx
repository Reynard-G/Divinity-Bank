import { useEffect, useState } from 'react';

import { Icon } from '@iconify/react';

export default function DashboardGreeting() {
  const [greeting, setGreeting] = useState(null);
  const [greetingIcon, setGreetingIcon] = useState(null);

  useEffect(() => {
    const currentHour = new Date().getHours();

    if (currentHour >= 5 && currentHour < 12) {
      setGreeting('Good Morning!');
      setGreetingIcon(<Icon icon='meteocons:sunrise-fill' fontSize='2rem' />);
    } else if (currentHour >= 12 && currentHour < 18) {
      setGreeting('Good Afternoon!');
      setGreetingIcon(<Icon icon='meteocons:clear-day-fill' fontSize='2rem' />);
    } else {
      setGreeting('Good Night!');
      setGreetingIcon(<Icon icon='meteocons:moonrise-fill' fontSize='2rem' />);
    }
  }, []);

  return (
    <div className='flex flex-row items-center gap-2'>
      <h2 className='text-sm font-medium text-default-700 md:text-base lg:text-xl'>
        {greeting}
      </h2>
      {greetingIcon}
    </div>
  );
}
