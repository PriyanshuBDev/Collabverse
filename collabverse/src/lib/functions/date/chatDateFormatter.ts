import { format, isToday, isValid } from "date-fns";

export default function chatDateFormatter(date: Date | string | null | undefined) {
  if (date == null) return "";
  const newDate = new Date(date);
  if (!isValid(newDate)) return "";
  if (isToday(newDate)) {
    return format(newDate, "HH:mm");
  } else {
    return format(newDate, "dd-MM-yyyy");
  }
}
