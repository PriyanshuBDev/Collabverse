import { getProjectSearchbar } from "@/lib/axios/workspace/project/getProjectSearchBar";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useQuery } from "@tanstack/react-query";

export function useProjectSearch(search: string) {
  const { id } = useCurrentWorkspace();
  const debouncedSearch = useDebounce(search, 300);
  const searchProject = useQuery({
    queryKey: [id, "projects", debouncedSearch],
    queryFn: ({ signal }) =>
      getProjectSearchbar({ workspaceId: id, search: debouncedSearch, signal }),
    enabled: !!id && !!debouncedSearch && debouncedSearch.length >= 2,
    staleTime: 1000 * 60 * 2,
  });
  return {
    searchedProjects: searchProject.data,
    isLoading: searchProject.isLoading,
    isSearching: searchProject.isFetching,
    isError: searchProject.isError,
    error: searchProject.error,
  };
}
