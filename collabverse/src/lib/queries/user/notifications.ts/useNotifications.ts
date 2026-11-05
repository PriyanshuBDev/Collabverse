import {
  cursorProps,
  notificationProps,
  notificationResProps,
} from "@/app/interfaces";
import { getNotifications } from "@/lib/axios/user/notifications/getNotifications";
import { markAllRead } from "@/lib/axios/user/notifications/markAllRead";
import { markRead } from "@/lib/axios/user/notifications/markRead";
import { getApiErrorMessage } from "@/lib/functions/error/getApiErrorMessage";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ApiError } from "next/dist/server/api-utils";
import { useEffect } from "react";
import { toast } from "sonner";

export function useNotifications(workspaceId?: string) {
  const { id } = useCurrentUser();
  const queryClient = useQueryClient();
  const notifications = useInfiniteQuery({
    queryKey: ["user", id, "notifications", workspaceId],
    initialPageParam: undefined as cursorProps | undefined,
    queryFn: async ({ pageParam }) =>
      getNotifications({
        workspaceId,
        cursorCreatedAt: pageParam?.cursorCreatedAt,
        cursorId: pageParam?.cursorId,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
  const markReadMutation = useMutation({
    mutationFn: markRead,
    onMutate: async (notificationId: string) => {
      await queryClient.cancelQueries({
        queryKey: ["user", id, "notifications"],
      });
      const previousData = queryClient.getQueriesData<
        InfiniteData<notificationResProps>
      >({ queryKey: ["user", id, "notifications"] });
      queryClient.setQueriesData<InfiniteData<notificationResProps>>(
        { queryKey: ["user", id, "notifications"] },
        (oldData: InfiniteData<notificationResProps, unknown> | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((p: notificationResProps) => ({
              ...p,
              notifications: p.notifications.filter(
                (n: notificationProps) => n.id !== notificationId,
              ),
            })),
          };
        },
      );
      queryClient.setQueryData<number>(
        ["user", id, "notification-count", undefined],
        (old: number = 0) => Math.max(0, old - 1),
      );
      if (workspaceId) {
        queryClient.setQueryData<number>(
          ["user", id, "notification-count", workspaceId],
          (old: number = 0) => Math.max(0, old - 1),
        );
      }
      return { previousData };
    },
    onError: (_err: AxiosError<ApiError>, _vars, context) => {
      context?.previousData?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      toast.error(getApiErrorMessage(_err, "Failed to mark notification read"));
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["user", id, "notifications"],
        refetchType: "none",
      });
    },
  });
  const markAllReadMutation = useMutation({
    mutationFn: markAllRead,
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ["user", id, "notifications"],
      });

      const previousData = queryClient.getQueriesData<
        InfiniteData<notificationResProps>
      >({
        queryKey: ["user", id, "notifications"],
      });

      queryClient.setQueriesData<InfiniteData<notificationResProps>>(
        { queryKey: ["user", id, "notifications"] },
        (oldData: InfiniteData<notificationResProps, unknown> | undefined) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((p: notificationResProps) => ({
              ...p,
              notifications: [],
            })),
          };
        },
      );
      if (workspaceId) {
        queryClient.setQueriesData(
          { queryKey: ["user", id, "notification-count", workspaceId] },
          () => 0,
        );
      } else {
        queryClient.setQueriesData(
          { queryKey: ["user", id, "notification-count", undefined] },
          () => 0,
        );
      }
      return { previousData };
    },
    onError: (err: AxiosError<ApiError>, _vars, context) => {
      context?.previousData?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      toast.error(
        getApiErrorMessage(err, "Failed to mark all notifications read"),
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["user", id, "notifications"],
        refetchType: "none",
      });
      queryClient.invalidateQueries({
        queryKey: ["user", id, "notification-count"],
      });
    },
  });
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        queryClient.invalidateQueries({
          queryKey: ["user", id, "notifications", workspaceId],
        });
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [id, workspaceId, queryClient]);

  return { ...notifications, markReadMutation, markAllReadMutation };
}
