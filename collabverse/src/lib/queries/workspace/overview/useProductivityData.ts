import { getProductivityData } from "@/lib/axios/workspace/overview/getProductivityData";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useQuery } from "@tanstack/react-query";

export function useProductivityData(timePeriod: "Week" | "Month") {
  const { id } = useCurrentWorkspace();
  return useQuery({
    queryKey: ["workspace", id, "home", "productivity", timePeriod],
    queryFn: () => getProductivityData({ workspaceId: id, timePeriod }),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!id,
  });
}
