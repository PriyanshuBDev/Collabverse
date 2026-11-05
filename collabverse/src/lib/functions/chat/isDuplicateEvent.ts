import { eventType } from "@/app/interfaces";

const seenEvents = new Set<string>();

export function isDuplicateEvent(
  tableName: string,
  eventType: eventType,
  id: string,
) {
  const key = `${tableName}-${eventType}-${id}`;

  if (seenEvents.has(key)) return true;

  seenEvents.add(key);

  setTimeout(() => {
    seenEvents.delete(key);
  }, 5000);

  return false;
}
