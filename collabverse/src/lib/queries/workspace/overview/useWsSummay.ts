import { getWorkspaceSummary } from "@/lib/axios/workspace/overview/getWorkspaceSummary";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useQuery } from "@tanstack/react-query";

export function useWsSummary() {
  const { id } = useCurrentWorkspace();
  return useQuery({
    queryKey: ["workspace", id, "home", "summary"],
    queryFn: () => getWorkspaceSummary(id),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!id,
  });
}
