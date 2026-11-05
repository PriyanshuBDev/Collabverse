import { format, isYesterday } from "date-fns";
import { isToday } from "date-fns";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";

export function DateFormatter(d: Date | string | number) {
  const date = new Date(d);
  if (isToday(date)) {
    return formatDistanceToNow(date, { addSuffix: true });
  } else if (isYesterday(date)) {
    const time = format(date, "HH:mm");
    return `Yesterday • ${time}`;
  } else {
    const absolute = format(date, "dd MMM yyy");
    const relative = formatDistanceToNow(date, { addSuffix: true });
    return `${absolute} • ${relative}`;
  }
}
