import { getCurrentTask } from "@/lib/axios/workspace/project/tasks/getCurrentTask";
import { useCurrentProject } from "@/lib/hooks/useCurrentProject";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useQuery } from "@tanstack/react-query";

export function useGetCurrentTask(slug: string) {
  const { id } = useCurrentWorkspace();
  const project = useCurrentProject();
  return useQuery({
    queryKey: [id, project.id, "task", slug],
    queryFn: () =>
      getCurrentTask({ workspaceId: id, slug, projectId: project.id }),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: false,
    enabled: !!id || !!project.id,
  });
}
