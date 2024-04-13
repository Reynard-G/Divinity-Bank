import { useEffect, useState } from 'react';

import MeteoCleardayIcon from '@/components/Icon/MeteoCleardayIcon';
import MeteoMoonsetIcon from '@/components/Icon/MeteoMoonsetIcon';
import MeteoSunriseIcon from '@/components/Icon/MeteoSunriseIcon';

export default function DashboardGreeting() {
  const [greeting, setGreeting] = useState(null);
  const [greetingIcon, setGreetingIcon] = useState(null);

  useEffect(() => {
    const currentHour = new Date().getHours();

    if (currentHour >= 5 && currentHour < 12) {
      setGreeting('Good Morning!');
      setGreetingIcon(<MeteoSunriseIcon width={36} height={36} />);
    } else if (currentHour >= 12 && currentHour < 18) {
      setGreeting('Good Afternoon!');
      setGreetingIcon(<MeteoCleardayIcon width={36} height={36} />);
    } else {
      setGreeting('Good Night!');
      setGreetingIcon(<MeteoMoonsetIcon width={36} height={36} />);
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
