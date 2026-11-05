import { format, isYesterday } from "date-fns";
import { isToday } from "date-fns";

export function DateFormatter3(d: Date | number | string) {
  const date = new Date(d);
  if (isToday(date)) {
    return `Today, ${format(date, "HH:mm")}`;
  } else if (isYesterday(date)) {
    const time = format(date, "HH:mm");
    return `Yesterday • ${time}`;
  } else {
    return `${format(date, "dd MMM yyy, HH:mm")}`;
  }
}
