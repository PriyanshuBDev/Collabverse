"use client";

import { supabaseBrowser } from "@/lib/supabase/browser";
import { useEffect, useMemo } from "react";
import { getSingleNotification } from "@/lib/axios/user/notifications/getSingleNotification";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { notificationProps, notificationResProps } from "@/app/interfaces";
import { NotificationType } from "@prisma/client";
import { useNotificationToastStore } from "../zustand/notification/useNotificationStore";
import { useUserAppbar } from "@/lib/queries/user/useUserAppbar";
type NotificationDB = {
  id: string;
  userId: string;
  type: NotificationType;
  target: JSON | null;
  routeTo: string | null;
  meta: JSON | null;
  createdAt: Date;
  read: boolean;
  readAt: Date | null;
  workspaceId: string | null;
  senderId: string | null;
  projectId: string | null;
};
export function useNotificationRT(userId: string) {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const { user, isLoading } = useUserAppbar();
  const queryClient = useQueryClient();
  useEffect(() => {
    if (isLoading || !user) return;
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Notification",
          filter: `userId=eq.${userId}`,
        },
        async (payload) => {
          const notificationPayload =
            payload.eventType === "DELETE"
              ? (payload.old as NotificationDB)
              : (payload.new as NotificationDB);

          switch (payload.eventType) {
            case "INSERT":
              queryClient.setQueryData(
                ["user", userId, "notification-count"],
                (old: number) => (old ?? 0) + 1,
              );
              if (notificationPayload.workspaceId) {
                queryClient.setQueryData(
                  [
                    "user",
                    userId,
                    "notification-count",
                    notificationPayload.workspaceId,
                  ],
                  (old: number) => (old ?? 0) + 1,
                );
              }

              try {
                const fullNotification = await getSingleNotification(
                  notificationPayload.id,
                );
                if (!user.mute) {
                  const addToast = useNotificationToastStore.getState().add;

                  addToast(fullNotification);
                }
                const queries = queryClient
                  .getQueryCache()
                  .findAll({ queryKey: ["user", userId, "notifications"] });
                queries.forEach((query) => {
                  const key = query.queryKey as [
                    "user",
                    string,
                    "notifications",
                    string | undefined,
                  ];
                  const workspaceId = key[3];
                  if (
                    workspaceId &&
                    workspaceId !== notificationPayload.workspaceId
                  ) {
                    return;
                  }
                  queryClient.setQueryData<InfiniteData<notificationResProps>>(
                    query.queryKey,
                    (
                      oldData:
                        | InfiniteData<notificationResProps, unknown>
                        | undefined,
                    ) => {
                      if (!oldData || oldData.pages.length === 0) {
                        return {
                          pages: [
                            {
                              notifications: [fullNotification],
                              nextCursor: null,
                              hasMore: true,
                            },
                          ],
                          pageParams: [undefined],
                        };
                      }

                      return {
                        ...oldData,
                        pages: [
                          {
                            ...oldData.pages[0],
                            notifications: [
                              fullNotification,
                              ...oldData.pages[0]?.notifications.filter(
                                (n: notificationProps) =>
                                  n.id !== fullNotification.id,
                              ),
                            ],
                          },
                          ...oldData.pages.slice(1),
                        ],
                      };
                    },
                  );
                });
              } catch (e) {
                console.error("Failed to fetch realtime notification", e);
              }
            case "UPDATE": {
              if (!notificationPayload.read && !notificationPayload.readAt)
                return;
              queryClient.setQueryData(
                ["user", userId, "notification-count"],
                (old: number) => (old ?? 0) - 1,
              );
              if (notificationPayload.workspaceId) {
                queryClient.setQueryData(
                  [
                    "user",
                    userId,
                    "notification-count",
                    notificationPayload.workspaceId,
                  ],
                  (old: number) => (old ?? 0) - 1,
                );
              }
              const queries = queryClient
                .getQueryCache()
                .findAll({ queryKey: ["user", userId, "notifications"] });
              queries.forEach((query) => {
                const key = query.queryKey as [
                  "user",
                  string,
                  "notifications",
                  string | undefined,
                ];
                const workspaceId = key[3];
                if (
                  workspaceId &&
                  workspaceId !== notificationPayload.workspaceId
                ) {
                  return;
                }
                queryClient.setQueryData<InfiniteData<notificationResProps>>(
                  query.queryKey,
                  (
                    oldData:
                      | InfiniteData<notificationResProps, unknown>
                      | undefined,
                  ) => {
                    if (!oldData) return oldData;

                    return {
                      ...oldData,
                      pages: [
                        {
                          ...oldData.pages[0],
                          notifications: [
                            ...oldData.pages[0]?.notifications.filter(
                              (n: notificationProps) =>
                                n.id !== notificationPayload.id,
                            ),
                          ],
                        },
                        ...oldData.pages.slice(1),
                      ],
                    };
                  },
                );
              });
            }
            case "DELETE": {
            }
          }
        },
      )
      .subscribe((status, error) => {
        console.log("REALTIME NOTIFICATION STATUS:", status, error);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient, supabase, user, isLoading]);
}
