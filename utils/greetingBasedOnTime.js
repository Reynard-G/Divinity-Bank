import { CloudSun, Moon, Sun } from 'lucide-react';

/**
 * Returns a greeting and corresponding icon based on the current time.
 *
 * @returns {Object} An object containing the greeting text and icon.
 */
export default function greetingBasedOnTime(username) {
  const currentHour = new Date().getHours();

  if (currentHour >= 5 && currentHour < 12) {
    return { text: `Good Morning, ${username}!`, icon: <CloudSun size={20} /> };
  } else if (currentHour >= 12 && currentHour < 18) {
    return { text: `Good Afternoon, ${username}!`, icon: <Sun size={20} /> };
  } else {
    return { text: `Good Night, ${username}!`, icon: <Moon size={20} /> };
  }
}
