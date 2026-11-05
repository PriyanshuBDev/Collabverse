import { getNewUsersForDm } from "@/lib/axios/workspace/conversation/dm/new/getNewUsersForDm";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useSearch } from "@/lib/hooks/useSearch";
import { useInfiniteQuery } from "@tanstack/react-query";

export function useNewUsersForDm(search?: string) {
  const ws = useCurrentWorkspace();
  const actualSearch = useSearch(search);
  return useInfiniteQuery({
    queryKey: [ws.id, "conversations", "dm", "new-users", actualSearch],
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) =>
      await getNewUsersForDm({
        workspaceId: ws.id,
        cursor: pageParam,
        search: actualSearch,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
