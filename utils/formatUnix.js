// Function for transforming unix to string date short form & long form
export default function formatUnix(unix, long = false) {
  const date = new Date(unix * 1000);
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  if (long) {
    options.month = 'long';
  }

  return date.toLocaleDateString('en-US', options);
}