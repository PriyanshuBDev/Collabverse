import { getProjectUsersFilteredByRole } from "@/lib/axios/workspace/project/users/getProjectUsersFilteredByRole";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { PRole } from "@prisma/client";
import { useInfiniteQuery } from "@tanstack/react-query";

export function useProjectUserFilterByRole({
  projectId,
  search,
  role,
}: {
  projectId: string;
  search?: string;
  role?: PRole;
}) {
  const ws = useCurrentWorkspace();
  const debouncedSearch = useDebounce(search, 300);
  const normalizedSearch = debouncedSearch?.trim() ?? "";
  const shouldSearch = normalizedSearch.length >= 2;
  const actualSearch = shouldSearch ? normalizedSearch : "";
  return useInfiniteQuery({
    queryKey: [
      ws.id,
      "project",
      projectId,
      "users",
      "filter-role",
      actualSearch,
      role,
    ],
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) =>
      await getProjectUsersFilteredByRole({
        workspaceId: ws.id,
        projectId,
        role,
        search,
        cursor: pageParam,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
