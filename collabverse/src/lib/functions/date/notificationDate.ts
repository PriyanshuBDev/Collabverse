import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { format, differenceInDays } from "date-fns";

export function notificationDate(date: Date) {
  const now = new Date();
  const days = differenceInDays(now, date);

  const time = format(date, "hh:mm a");
  // e.g. "10:45 PM"

  if (days === 0) {
    return `${formatDistanceToNow(date, { addSuffix: true })} • ${time}`;
    // "2h ago • 10:45 PM"
  }

  if (days === 1) {
    return `Yesterday • ${time}`;
    // "Yesterday • 10:45 PM"
  }

  if (days < 7) {
    return `${format(date, "EEEE")} • ${time}`;
    // "Monday • 10:45 PM"
  }

  if (days < 365) {
    return `${format(date, "MMM d")} • ${time}`;
    // "Apr 5 • 10:45 PM"
  }

  return `${format(date, "MMM d, yyyy")} • ${time}`;
  // "Apr 5, 2024 • 10:45 PM"
}
