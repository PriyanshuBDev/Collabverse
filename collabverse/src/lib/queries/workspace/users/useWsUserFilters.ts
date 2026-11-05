import { getFilters } from "@/lib/axios/workspace/users/getFilters";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useCurrentWorkspace } from "../../../hooks/useCurrentWorkspace";

export const useWsUserFilters = () => {
  const { id } = useCurrentWorkspace();
  return useQuery({
    queryKey: ["worksapce", id, "users-filters"],
    queryFn: async () => await getFilters({ workspaceId: id }),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
};
