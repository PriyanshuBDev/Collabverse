import { chatListProps } from "@/app/interfaces";

export function sortConvoList(a: chatListProps, b: chatListProps) {
  const aPinned = a.pinIdx !== undefined;
  const bPinned = b.pinIdx !== undefined;
  if (aPinned && bPinned) {
    return a.pinIdx! - b.pinIdx!;
  }
  if (aPinned) return -1;
  if (bPinned) return 1;
  return (
    new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime()
  );
}
