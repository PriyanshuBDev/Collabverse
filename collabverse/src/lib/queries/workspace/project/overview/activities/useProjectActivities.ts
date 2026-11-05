import { activityProps, activityResponse } from "@/app/interfaces";
import { getProjectActivities } from "@/lib/axios/workspace/project/activities/getProjectActivities";
import { getSingleProjectActivity } from "@/lib/axios/workspace/project/activities/getSingleProjectActivity";
import { useCurrentProject } from "@/lib/hooks/useCurrentProject";
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

export function useProjectActivities() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const ws = useCurrentWorkspace();
  const project = useCurrentProject();
  const user = useCurrentUser();
  const queryKey = [ws.id, "project", project.id, "activities"];
  const queryClient = useQueryClient();
  const activities = useInfiniteQuery({
    queryKey,
    initialPageParam: undefined as
      | { cursorId: string; cursorCreatedAt: Date }
      | undefined,
    queryFn: async ({ pageParam }) =>
      getProjectActivities({
        workspaceId: ws.id,
        projectId: project.id,
        cursorCreatedAt: pageParam?.cursorCreatedAt,
        cursorId: pageParam?.cursorId,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!project.id || !user.id || !ws.id) return;

    const channel = supabase
      .channel(`project-activities-${project.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Activity",
        },
        async (payload) => {
          if (payload.new.projectId !== project.id) return;
          const newActivity = payload.new;
          // if(newActivity.actorUserId === user.id)return;
          const ProjectActivityTypes: ActivityType[] = [
            "project_avatar_updated",
            "project_created",
            "project_description_updated",
            "project_due_updated",
            "project_member_added",
            "project_member_left",
            "project_member_removed",
            "project_member_role_changed",
            "project_mentioned",
            "project_name_updated",
            "project_ownership_changed",
            "task_created",
            "task_deleted",
            "other",
          ];
          const isProjectLevel = !newActivity.taskId;
          const isAllowedTaskActivity =
            newActivity.taskId &&
            ProjectActivityTypes.includes(newActivity.type);
          if (!isProjectLevel && !isAllowedTaskActivity) return;
          try {
            const fullActivity = await getSingleProjectActivity({
              workspaceId: ws.id,
              projectId: project.id,
              activityId: newActivity.id,
            });
            queryClient.setQueryData<InfiniteData<activityResponse>>(
              [ws.id, "project", project.id, "activities"],
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
  }, [ws.id, project.id, user.id, queryClient, supabase]);
  return { ...activities };
}
