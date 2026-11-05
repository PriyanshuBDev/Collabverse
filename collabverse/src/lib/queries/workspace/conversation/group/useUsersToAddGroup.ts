import { getUsersToAddGroup } from "@/lib/axios/workspace/conversation/group/getUsersToAddGroup";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useInfiniteQuery } from "@tanstack/react-query";

export function useUsersToAddGroup(search?: string, groupId?: string) {
  const ws = useCurrentWorkspace();
  const debouncedSearch = useDebounce(search, 300);
  const normalizedSearch = debouncedSearch?.trim() ?? "";
  const shouldSearch = normalizedSearch.length >= 2;
  const actualSearch = shouldSearch ? normalizedSearch : undefined;
  const users = useInfiniteQuery({
    queryKey: [ws.id, "conversations", "group", groupId, "users", actualSearch],
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) =>
      await getUsersToAddGroup({
        workspaceId: ws.id,
        groupId,
        cursor: pageParam,
        search: actualSearch,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return {
    ...users,
  };
}
