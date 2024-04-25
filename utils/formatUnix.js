// Function for transforming unix to string date short form & long form
export default function formatUnix(unix, long = false) {
  const date = new Date(unix * 1000);
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  return long
    ? date.toLocaleTimeString('en-US', options)
    : date.toLocaleDateString('en-US', options);
}
