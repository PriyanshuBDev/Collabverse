import { CompleteCommentProps } from "@/app/interfaces";
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

function commentTime(comment: CompleteCommentProps): number {
  return (
    parseTimestamp(comment.sentAt) ?? parseTimestamp(comment.createdAt) ?? 0
  );
}

export function getSortedGroupedComments(comments: CompleteCommentProps[]) {
  const sortedComments = [...comments].sort(
    (a: CompleteCommentProps, b: CompleteCommentProps) =>
      commentTime(a) - commentTime(b) || a.id.localeCompare(b.id),
  );

  const grouped = new Map<string, CompleteCommentProps[]>();

  for (const comment of sortedComments) {
    const date = new Date(commentTime(comment)).toISOString().slice(0, 10);
    const group = grouped.get(date) ?? [];
    group.push(comment);
    grouped.set(date, group);
  }

  return [...grouped.entries()].sort(
    (
      [a]: [string, CompleteCommentProps[]],
      [b]: [string, CompleteCommentProps[]],
    ) => a.localeCompare(b),
  );
}
