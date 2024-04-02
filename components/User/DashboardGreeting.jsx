import { useEffect, useState } from 'react';

import { Icon } from '@iconify/react';

export default function DashboardGreeting() {
  const [greeting, setGreeting] = useState(null);
  const [greetingIcon, setGreetingIcon] = useState(null);

  useEffect(() => {
    const currentHour = new Date().getHours();

    if (currentHour >= 5 && currentHour < 12) {
      setGreeting('Good Morning!');
      setGreetingIcon('meteocons:sunrise-fill');
    } else if (currentHour >= 12 && currentHour < 18) {
      setGreeting('Good Afternoon!');
      setGreetingIcon('meteocons:clear-day-fill');
    } else {
      setGreeting('Good Night!');
      setGreetingIcon('meteocons:moonrise-fill');
    }
  }, []);

  return (
    <div className='flex flex-row items-center gap-2'>
      <h2 className='text-sm font-medium text-default-700 md:text-base lg:text-xl'>
        {greeting}
      </h2>
      <Icon icon={greetingIcon} fontSize='2rem' />
    </div>
  );
}
