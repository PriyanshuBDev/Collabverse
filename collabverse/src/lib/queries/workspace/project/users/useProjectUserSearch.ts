import { searchProjectUsers } from "@/lib/axios/workspace/project/users/searchProjectUsers";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useQuery } from "@tanstack/react-query";

export function useProjectUserSearch(
  search: string,
  projectId: string,
  mode?: string,
) {
  const { id } = useCurrentWorkspace();
  const debouncedSearch = useDebounce(search, 300);
  const searchUsers = useQuery({
    queryKey: [id, projectId, "users", "quick-search", debouncedSearch, mode],
    queryFn: ({ signal }) =>
      searchProjectUsers({
        workspaceId: id,
        projectId,
        search: debouncedSearch,
        mode,
        signal,
      }),
    enabled: !!id && !!debouncedSearch && debouncedSearch.length >= 2,
    staleTime: 1000 * 60 * 2,
  });
  return {
    searchedUsers: searchUsers.data,
    isLoading: searchUsers.isLoading,
    isSearching: searchUsers.isFetching,
    isError: searchUsers.isError,
    error: searchUsers.error,
  };
}
