import { getRecentProjects } from "@/lib/axios/workspace/overview/getRecentProjects";
import { useQuery } from "@tanstack/react-query";
import { useCurrentWorkspace } from "../../../hooks/useCurrentWorkspace";

export const useRecentProjects = () => {
  const { id } = useCurrentWorkspace();
  return useQuery({
    queryKey: ["workspace", id, "home", "recent-projects"],
    queryFn: () => getRecentProjects(id),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!id,
  });
};
