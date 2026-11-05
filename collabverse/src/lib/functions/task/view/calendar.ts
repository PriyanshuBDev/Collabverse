interface gridProps {
  date: Date;
  outside: boolean;
}

export function getDaysInMonth(year: number, month: number) {
  const days = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

export function getMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const firstWeekDay = firstDay.getDay();

  const daysInMonth = getDaysInMonth(year, month);

  const grid: gridProps[] = [];
  for (let i = 0; i < firstWeekDay; i++) {
    const d = new Date(year, month, 1 - (firstWeekDay - i));
    grid.push({ date: d, outside: true });
  }
  for (const d of daysInMonth) {
    grid.push({ date: d, outside: false });
  }
  while (grid.length < 42) {
    const last = grid[grid.length - 1].date;
    const d = new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1);
    grid.push({ date: d, outside: true });
  }
  return grid;
}
