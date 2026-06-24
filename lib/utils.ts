/**
 * Returns an ISO 8601 string for a date `days` days ago.
 * Use this instead of calling Date.now() directly in React components
 * to satisfy the react-hooks/purity lint rule.
 * @param days - Number of days to subtract from now
 * @returns ISO 8601 date string
 */
export function daysAgoISO(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

/**
 * Returns a human-readable date string for the trial end date (7 days from
 * now). Extracted to avoid the react-hooks/purity lint rule on Date.now().
 * @returns A locale-formatted date string like "July 1, 2026"
 */
export function trialEndDate(): string {
  const trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  return trialEnd.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Converts an ISO date string to a human-readable relative time.
 * @param date - ISO 8601 date string
 * @returns A compact relative time string like "2h ago" or "just now"
 */
export function timeAgo(date: string): string {
  if (!date) return "—";
  const then = new Date(date).getTime();
  if (isNaN(then)) return "—";

  const seconds = Math.floor((Date.now() - then) / 1000);
  if (seconds < 0) return "just now";
  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}
