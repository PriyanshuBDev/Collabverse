import { getTaskCalendar } from "@/lib/axios/workspace/project/tasks/view/getTaskCalendar";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { Priority, TaskStatus } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

export function useTaskCalendar({
  projectId,
  date,
  priority,
  search,
  status,
  assignedTo,
}: {
  projectId: string;
  date: Date;
  priority?: Priority;
  status?: TaskStatus;
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
    "calendar",
    date.toISOString(),
    status,
    priority,
    assignedTo,
    actualSearch,
  ];
  const query = useQuery({
    queryKey,
    queryFn: ({ signal }) =>
      getTaskCalendar({
        workspaceId: ws.id,
        projectId,
        date,
        status,
        priority,
        assignedTo,
        search: actualSearch,
        signal,
      }),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!ws.id,
  });
  return { ...query };
}
