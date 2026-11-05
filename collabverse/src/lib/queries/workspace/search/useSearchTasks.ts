import { getAllSearchTasks } from "@/lib/axios/workspace/search/getAllSearchTasks";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useQuery } from "@tanstack/react-query";

export function useSearchTasks({
  page,

  search,
}: {
  page: number;

  search?: string;
}) {
  const ws = useCurrentWorkspace();
  const debouncedSearch = useDebounce(search, 300);
  const normalizedSearch = debouncedSearch?.trim() ?? "";
  const actualSearch = normalizedSearch.length >= 2 ? normalizedSearch : "";
  const queryKey = [ws.id, "tasks", "search", page, actualSearch];
  const query = useQuery({
    queryKey,
    queryFn: () =>
      getAllSearchTasks({
        workspaceId: ws.id,

        page,

        search: actualSearch,
      }),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!ws.id,
  });
  return { ...query };
}
