import { format, isToday } from "date-fns";

export default function chatDateFormatter(date: Date | string) {
  const newDate = new Date(date);
  if (isToday(newDate)) {
    return format(newDate, "HH:mm");
  } else {
    return format(newDate, "dd-MM-yyy");
  }
}
