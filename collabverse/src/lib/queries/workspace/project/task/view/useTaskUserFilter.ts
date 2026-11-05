import { getTaskUserFilter } from "@/lib/axios/workspace/project/tasks/view/getTaskUserFilter";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useQuery } from "@tanstack/react-query";

export function useTaskUserFilter(projectId: string) {
  const ws = useCurrentWorkspace();
  return useQuery({
    queryKey: [ws.id, projectId, "tasks", "user-filter"],
    queryFn: () => getTaskUserFilter({ workspaceId: ws.id, projectId }),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
