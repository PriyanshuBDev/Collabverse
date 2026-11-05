import { getCurrentProject } from "@/lib/axios/workspace/project/getCurrentProject";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useQuery } from "@tanstack/react-query";

export function useGetCurrentProject(slug: string) {
  const { id } = useCurrentWorkspace();
  return useQuery({
    queryKey: [id, "project", slug],
    queryFn: () => getCurrentProject({ workspaceId: id, slug }),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: false,
    enabled: !!id,
  });
}
