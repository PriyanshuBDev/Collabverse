import { addDays, isAfter, startOfDay } from "date-fns";

export function getDaysUpToToday(start: Date) {
  const days: Date[] = [];
  let current = startOfDay(start);
  const today = startOfDay(new Date());
  while (!isAfter(current, today)) {
    days.push(current);
    current = addDays(current, 1);
  }
  return days;
}
