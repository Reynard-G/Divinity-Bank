/**
 * Returns a greeting and corresponding icon based on the current time.
 *
 * @returns {Object} An object containing the greeting text and icon.
 */
export default function greetingBasedOnTime() {
  const currentHour = new Date().getHours();

  if (currentHour >= 5 && currentHour < 12) {
    return { text: 'Good Morning!', icon: 'meteocons:fog-day-fill' };
  } else if (currentHour >= 12 && currentHour < 18) {
    return { text: 'Good Afternoon!', icon: 'meteocons:clear-day-fill' };
  } else {
    return { text: 'Good Night!', icon: 'meteocons:fog-night-fill' };
  }
}
