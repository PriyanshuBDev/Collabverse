import { activityProps, activityResponse } from "@/app/interfaces";
import { getSingleWsActivity } from "@/lib/axios/workspace/overview/activities/getSingleWsActivity";
import { getWsActivities } from "@/lib/axios/workspace/overview/activities/getWsActivities";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { ActivityType } from "@prisma/client";
import {
  InfiniteData,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

export function useWsActivities() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const ws = useCurrentWorkspace();
  const user = useCurrentUser();
  const queryKey = ["workspace", ws.id, "activities"];
  const queryClient = useQueryClient();
  const activities = useInfiniteQuery({
    queryKey,
    initialPageParam: undefined as
      | { cursorId: string; cursorCreatedAt: Date }
      | undefined,
    queryFn: async ({ pageParam }) =>
      getWsActivities({
        workspaceId: ws.id,
        cursorCreatedAt: pageParam?.cursorCreatedAt,
        cursorId: pageParam?.cursorId,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!ws.id || !user.id) return;
    const channel = supabase
      .channel(`workspace-activities-${ws.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Activity",
        },
        async (payload) => {
          const newActivity = payload.new;
          if (newActivity.workspaceId !== ws.id) return;
          // if(newActivity.actorUserId === user.id)return;
          const WsActivityTypes: ActivityType[] = [
            "project_created",
            "project_deleted",
            "workspace_avatar_updated",
            "workspace_created",
            "workspace_description_updated",
            "workspace_member_added",
            "workspace_member_left",
            "workspace_member_removed",
            "workspace_member_role_changed",
            "workspace_name_updated",
            "workspace_ownership_changed",
            "workspace_settings_updated",
            "other",
          ];
          const isWsLevel = !newActivity.taskId;
          const isAllowedTaskActivity =
            newActivity.taskId && WsActivityTypes.includes(newActivity.type);
          if (!isWsLevel && !isAllowedTaskActivity) return;
          try {
            const fullActivity = await getSingleWsActivity({
              workspaceId: ws.id,
              activityId: newActivity.id,
            });
            console.log(fullActivity);
            queryClient.setQueryData<InfiniteData<activityResponse>>(
              ["workspace", ws.id, "activities"],
              (
                oldData: InfiniteData<activityResponse, unknown> | undefined,
              ) => {
                if (!oldData) return oldData;
                return {
                  ...oldData,
                  pages: [
                    {
                      ...oldData.pages[0],
                      activities: [
                        fullActivity,
                        ...oldData.pages[0]?.activities.filter(
                          (a: activityProps) => a.id !== fullActivity.id,
                        ),
                      ],
                    },
                    ...oldData.pages.slice(1),
                  ],
                };
              },
            );
          } catch (e) {
            console.error("Failed to fetch realtime activity", e);
          }
        },
      )
      .subscribe((status) => {
        console.log("REALTIME STATUS:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ws.id, user.id, queryClient, supabase]);
  return { ...activities };
}
