import { differenceInDays, format, isTomorrow } from "date-fns";
import { isToday } from "date-fns";

export function DateFormatter5(d: Date | string | number) {
  const date = new Date(d);
  if (isToday(date)) {
    return "Today";
  } else if (isTomorrow(date)) {
    const time = format(date, "HH:mm");
    return `Tomorrow • ${time}`;
  } else {
    return `In ${differenceInDays(date, new Date())} days`;
  }
}
