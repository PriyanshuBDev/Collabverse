import { getProjects } from "@/lib/axios/workspace/project/getProjects";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useInfiniteQuery } from "@tanstack/react-query";

export const useGetProjects = (search?: string) => {
  const { id } = useCurrentWorkspace();

  const debouncedSearch = useDebounce(search, 300);
  const normalizedSearch = debouncedSearch?.trim() ?? "";
  const shouldSearch = normalizedSearch.length >= 2;

  const projectsQuery = useInfiniteQuery({
    queryKey: [id, "projects", shouldSearch ? normalizedSearch : ""],
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) =>
      await getProjects({
        workspaceId: id,
        cursorId: pageParam,
        search: shouldSearch ? normalizedSearch : "",
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 30_000, // 30 seconds
    gcTime: 5 * 60_000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    enabled: !!id,
  });
  return {
    ...projectsQuery,
  };
};
