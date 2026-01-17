/**
 * Format a date using the Intl.DateTimeFormat API
 */
export function formatDate(
  date: Date | string | number | undefined,
  opts: Intl.DateTimeFormatOptions = {}
) {
  if (!date) return "";

  return new Intl.DateTimeFormat("en-US", {
    month: opts.month ?? "short",
    day: opts.day ?? "numeric",
    year: opts.year ?? "numeric",
    hour: opts.hour ?? "numeric",
    minute: opts.minute ?? "2-digit",
    ...opts,
  }).format(new Date(date));
}

/**
 * Format a date to a relative time string
 */
export function formatRelativeDate(date: Date | string | number): string {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInMs = now.getTime() - targetDate.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) {
    return "just now";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
  } else {
    // For dates on the same year, show "MMM D at h:mm AM/PM"
    // For dates on different years, show "MMM D, YYYY"
    const isSameYear = now.getFullYear() === targetDate.getFullYear();
    return formatDate(targetDate, {
      month: "short",
      day: "numeric",
      year: isSameYear ? undefined : "numeric",
      hour: isSameYear ? "numeric" : undefined,
      minute: isSameYear ? "2-digit" : undefined,
    });
  }
}
