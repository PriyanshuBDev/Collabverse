import { Presence } from "@/lib/hooks/zustand/useOnlineUsers";

export function getUserStatus({
  userId,
  onlineUsers,
  lastSeenAt,
}: {
  userId: string;
  onlineUsers: Record<string, Presence>;
  lastSeenAt?: string | Date | null;
}) {
  const onlineUser = onlineUsers[userId];

  if (onlineUser) {
    return {
      isOnline: true,
      lastSeenAt: onlineUser.lastActivityAt,
    };
  }

  return {
    isOnline: false,
    lastSeenAt,
  };
}
