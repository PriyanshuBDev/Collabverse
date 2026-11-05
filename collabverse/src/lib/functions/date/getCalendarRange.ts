import { addDays, startOfMonth, startOfWeek } from "date-fns";

export function getCalendarRange(date: Date) {
  const monthStart = startOfMonth(date);
  const startDate = startOfWeek(monthStart, {
    weekStartsOn: 0,
  });
  const endDate = addDays(startDate, 41);
  return { startDate, endDate };
}
