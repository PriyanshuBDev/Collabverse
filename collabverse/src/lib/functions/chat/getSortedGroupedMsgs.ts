import { CompleteChatProps } from "@/app/interfaces";

function parseTimestamp(value: unknown): number | undefined {
  if (value instanceof Date) {
    const time = value.getTime();
    return Number.isFinite(time) ? time : undefined;
  }

  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }

  // Treat timezone-less ISO timestamps as UTC.
  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value);
  const time = Date.parse(hasTimezone ? value : `${value}Z`);

  return Number.isFinite(time) ? time : undefined;
}

function messageTime(message: CompleteChatProps): number {
  return (
    parseTimestamp(message.sentAt) ?? parseTimestamp(message.createdAt) ?? 0
  );
}

export function getSortedGroupedMsgs(messages: CompleteChatProps[]) {
  const sortedMessages = [...messages].sort(
    (a: CompleteChatProps, b: CompleteChatProps) =>
      messageTime(a) - messageTime(b) || a.id.localeCompare(b.id),
  );

  const grouped = new Map<string, CompleteChatProps[]>();

  for (const message of sortedMessages) {
    const date = new Date(messageTime(message)).toISOString().slice(0, 10);
    const group = grouped.get(date) ?? [];
    group.push(message);
    grouped.set(date, group);
  }

  return [...grouped.entries()].sort(
    ([a]: [string, CompleteChatProps[]], [b]: [string, CompleteChatProps[]]) =>
      a.localeCompare(b),
  );
}
