import { useDebounce } from "./useDebounce";

export function useSearch(search?: string, debounce?: number) {
  const debouncedSearch = useDebounce(search, debounce ?? 300);
  const normalizedSearch = debouncedSearch?.trim() ?? "";
  const shouldSearch = normalizedSearch.length >= 2;
  const actualSearch = shouldSearch ? normalizedSearch : undefined;
  return actualSearch;
}
