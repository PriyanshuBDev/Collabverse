import { getTaskBoard } from "@/lib/axios/workspace/project/tasks/view/getTaskBoard";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { Priority, TaskStatus } from "@prisma/client";
import { useInfiniteQuery } from "@tanstack/react-query";

export function useTaskBoard({
  projectId,
  status,
  due,
  priority,
  assignedTo,
  search,
}: {
  projectId: string;
  status: TaskStatus;
  due?: Date;
  priority?: Priority;
  assignedTo?: string;
  search?: string;
}) {
  const ws = useCurrentWorkspace();
  const debouncedSearch = useDebounce(search, 300);
  const normalizedSearch = debouncedSearch?.trim() ?? "";
  const actualSearch = normalizedSearch.length >= 2 ? normalizedSearch : "";
  const queryKey = [
    ws.id,
    projectId,
    "tasks",
    "board",
    status,
    due?.toISOString(),
    priority,
    assignedTo,
    actualSearch,
  ];
  const query = useInfiniteQuery({
    queryKey,
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam, signal }) =>
      await getTaskBoard({
        workspaceId: ws.id,
        projectId,
        lastPosition: pageParam !== undefined ? Number(pageParam) : undefined,
        status,
        priority,
        assignedTo,
        search: actualSearch,
        due,
        signal,
      }),
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore) return undefined;

      if (!lastPage.tasks.length) return undefined;

      return String(lastPage.tasks[lastPage.tasks.length - 1].position);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    enabled: !!ws.id,
  });

  return { ...query };
}
