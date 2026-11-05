import { getProjectUserFilters } from "@/lib/axios/workspace/project/users/getProjectUserFilters";
import { useCurrentProject } from "@/lib/hooks/useCurrentProject";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export function useProjectUserFilters() {
  const { id } = useCurrentWorkspace();
  const project = useCurrentProject();
  return useQuery({
    queryKey: [id, "project", project.id, "users-filters"],
    queryFn: async () =>
      await getProjectUserFilters({ workspaceId: id, projectId: project.id }),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}
