"use client";

import { useNotificationRT } from "@/lib/hooks/realtime/useNotificationsRT";
import useCurrentUser from "@/lib/hooks/useCurrentUser";

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { id } = useCurrentUser();
  useNotificationRT(id);
  return <>{children}</>;
}
