import { format, isThisYear } from "date-fns";

export default function CommentsDateIndicatorFormatter(
  d: Date | string | number,
) {
  const date = new Date(d);
  if (isThisYear(date)) {
    return format(date, "MMMM dd");
  }
  return format(date, "MMMM dd, yyyy");
}
