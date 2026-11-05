import { activityProps, activityResponse } from "@/app/interfaces";
import { getSingleTaskActivity } from "@/lib/axios/workspace/project/tasks/activities/getSingleTaskActivity";
import { getTaskActivities } from "@/lib/axios/workspace/project/tasks/activities/getTaskActivities";
import { useCurrentProject } from "@/lib/hooks/useCurrentProject";
import { useCurrentTask } from "@/lib/hooks/useCurrentTask";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { RealtimeChannel } from "@supabase/supabase-js";
import {
  InfiniteData,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useRef } from "react";

export function useTaskActivities() {
  const supabase = supabaseBrowser();
  const ws = useCurrentWorkspace();
  const project = useCurrentProject();
  const task = useCurrentTask();
  const user = useCurrentUser();
  const queryKey = [ws.id, project.id, "task", task.id, "activities"];
  const queryClient = useQueryClient();
  const activities = useInfiniteQuery({
    queryKey,
    initialPageParam: undefined as
      | { cursorId: string; cursorCreatedAt: Date }
      | undefined,
    queryFn: async ({ pageParam }) =>
      getTaskActivities({
        workspaceId: ws.id,
        projectId: project.id,
        taskId: task.id,
        cursorCreatedAt: pageParam?.cursorCreatedAt,
        cursorId: pageParam?.cursorId,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
  const channelRef = useRef<RealtimeChannel | null>(null);
  const retryRef = useRef(0);
  const reconnectingRef = useRef(false);
  useEffect(() => {
    if (!task.id || !user.id) return;
    if (channelRef.current) return;
    const createChannel = (): RealtimeChannel => {
      return supabase
        .channel(`task-activities-${task.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "Activity",
            filter: `taskId=eq.${task.id}`,
          },
          async (payload) => {
            const newActivity = payload.new;
            // if(newActivity.actorUserId === user.id)return;
            try {
              const fullActivity = await getSingleTaskActivity({
                workspaceId: ws.id,
                projectId: project.id,
                taskId: task.id,
                activityId: newActivity.id,
              });

              queryClient.setQueryData<InfiniteData<activityResponse>>(
                [ws.id, project.id, "task", task.id, "activities"],
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
          if (status === "SUBSCRIBED") {
            retryRef.current = 0;
            reconnectingRef.current = false;
          }
          if (status === "CLOSED" || status === "TIMED_OUT") {
            if (reconnectingRef.current) return;

            reconnectingRef.current = true;
            console.log("🔁 Reconnecting realtime...");

            if (channelRef.current) {
              supabase.removeChannel(channelRef.current);
              channelRef.current = null;
            }

            const retryDelay = Math.min(1000 * 2 ** retryRef.current, 10000);
            retryRef.current += 1;

            setTimeout(() => {
              if (!project.id || !user.id || !ws.id) return;
              if (!channelRef.current) {
                channelRef.current = createChannel();
              }
              reconnectingRef.current = false;
            }, retryDelay);
          }
        });
    };
    if (!channelRef.current) {
      channelRef.current = createChannel();
    }
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [ws.id, project.id, task.id, user.id, queryClient, supabase]);
  return { ...activities };
}
