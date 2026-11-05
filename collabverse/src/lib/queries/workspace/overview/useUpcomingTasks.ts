import { dueDateCursorProps } from "@/app/interfaces";
import { getUpcomingTasks } from "@/lib/axios/workspace/overview/getUpcomingTasks";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useInfiniteQuery } from "@tanstack/react-query";

export function useUpcomingTasks() {
  const { id } = useCurrentWorkspace();
  return useInfiniteQuery({
    queryKey: ["workspace", id, "home", "upcoming-tasks"],
    initialPageParam: undefined as dueDateCursorProps | undefined,
    queryFn: async ({ pageParam }) =>
      getUpcomingTasks(id, pageParam?.cursorDueDate, pageParam?.cursorId),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!id,
  });
}
