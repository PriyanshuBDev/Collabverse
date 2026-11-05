import { getProjectSidebar } from "@/lib/axios/workspace/project/getProjectSidebar";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useQuery } from "@tanstack/react-query";

export const useProjectSidebar = () => {
  const { id } = useCurrentWorkspace();
  return useQuery({
    queryKey: [id, "projects", "sidebar"],
    queryFn: () => getProjectSidebar({ workspaceId: id }),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
