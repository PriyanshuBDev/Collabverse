import { addWeeks } from "date-fns";
import { addHours, format, isToday } from "date-fns";

export default function muteDateFormatter(mute: string, mutedAt: Date) {
  if (mute === "eight") {
    let day: string;
    if (isToday(addHours(mutedAt, 8))) {
      day = "Today";
    } else {
      day = "Tommorow";
    }

    return `Muted until ${day} at ${format(addHours(mutedAt, 8), "HH:mm")}`;
  } else if (mute === "week") {
    return `Muted until ${format(addWeeks(mutedAt, 1), "dd-MM-yyyy HH:mm")}`;
  } else {
    return `Always muted`;
  }
}
