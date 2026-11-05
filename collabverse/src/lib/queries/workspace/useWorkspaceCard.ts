import getWorkspaces from "@/lib/axios/workspace/getWorkspaces";
import { useQuery } from "@tanstack/react-query";

export const useWorkspaceCard = (search?: string) => {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: () => getWorkspaces(search),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
