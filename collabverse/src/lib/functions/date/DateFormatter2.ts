import { format } from "date-fns";
import { isToday } from "date-fns";

export function DateFormatter2(d: Date | number | string) {
  const date = new Date(d);
  if (isToday(date)) {
    return "Today";
  } else {
    const absolute = format(date, "dd MMM yyy");
    return `${absolute}`;
  }
}
