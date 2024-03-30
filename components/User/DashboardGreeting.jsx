import { useEffect, useState } from 'react';

import { CloudSun, Moon, Sun } from 'lucide-react';

export default function DashboardGreeting() {
  const [greeting, setGreeting] = useState(null);
  const [greetingIcon, setGreetingIcon] = useState(null);

  useEffect(() => {
    const currentHour = new Date().getHours();

    if (currentHour >= 5 && currentHour < 12) {
      setGreeting('Good Morning!');
      setGreetingIcon(<CloudSun size={20} />);
    } else if (currentHour >= 12 && currentHour < 18) {
      setGreeting('Good Afternoon!');
      setGreetingIcon(<Sun color='#FBBF24' size={20} />);
    } else {
      setGreeting('Good Night!');
      setGreetingIcon(<Moon size={20} />);
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
