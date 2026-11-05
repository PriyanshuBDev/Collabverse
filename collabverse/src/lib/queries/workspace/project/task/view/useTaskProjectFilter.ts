import { getTaskProjectFilter } from "@/lib/axios/workspace/project/tasks/view/getTaskProjectFilter";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useQuery } from "@tanstack/react-query";

export function useTaskProjectFilter() {
  const { id } = useCurrentWorkspace();
  return useQuery({
    queryKey: [id, "projects", "tasks", "project-filter"],
    queryFn: () => getTaskProjectFilter({ workspaceId: id }),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
