import { quickSearchUsers } from "@/lib/axios/workspace/users/quickSearchUsers";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useQuery } from "@tanstack/react-query";

export function useQuickSearch(search: string) {
  const { id } = useCurrentWorkspace();
  const debouncedSearch = useDebounce(search, 300);
  const searchUsers = useQuery({
    queryKey: ["worksapce", id, "users", "quick-search", debouncedSearch],
    queryFn: ({ signal }) =>
      quickSearchUsers({ workspaceId: id, search: debouncedSearch, signal }),
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
