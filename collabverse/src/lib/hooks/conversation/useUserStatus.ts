import { useOnlineUsers } from "../zustand/useOnlineUsers";

export function useUserStatus({
  userId,
  lastSeenAt,
}: {
  userId?: string;
  lastSeenAt: Date | number | null;
}) {
  const onlineUsers = useOnlineUsers((s) => s.onlineUsers);
  if (!userId) {
    return {
      isOnline: false,
      lastSeenAt: null,
    };
  }
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
