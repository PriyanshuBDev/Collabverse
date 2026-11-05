import { getTaskTable } from "@/lib/axios/workspace/project/tasks/view/getTaskTable";

import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { Priority } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

export function useTaskTable({
  projectId,
  page,
  due,
  priority,
  assignedTo,
  search,
}: {
  projectId: string;
  page: number;
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
    "table",
    page,
    due?.toISOString(),
    priority,
    assignedTo,
    actualSearch,
  ];
  const query = useQuery({
    queryKey,
    queryFn: ({ signal }) =>
      getTaskTable({
        workspaceId: ws.id,
        projectId,
        page,
        priority,
        assignedTo,
        search: actualSearch,
        due,
        signal,
      }),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!ws.id,
  });
  return { ...query };
}
