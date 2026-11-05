import { taskCreateUsersProps } from "@/app/interfaces";
import { addUsersToTask } from "@/lib/axios/workspace/project/tasks/users/addUsersToTask";
import { getUsersToAdd } from "@/lib/axios/workspace/project/tasks/users/getUsersToAdd";
import {
  ApiError,
  getApiErrorMessage,
} from "@/lib/functions/error/getApiErrorMessage";
import { useCurrentProject } from "@/lib/hooks/useCurrentProject";
import { useCurrentTask } from "@/lib/hooks/useCurrentTask";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useDebounce } from "@/lib/hooks/useDebounce";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export function useAddUsers(search?: string) {
  const ws = useCurrentWorkspace();
  const project = useCurrentProject();
  const task = useCurrentTask();
  const queryClient = useQueryClient();
  const debouncedSearch = useDebounce(search, 300);
  const normalizedSearch = debouncedSearch?.trim() ?? "";
  const shouldSearch = normalizedSearch.length >= 2;
  const actualSearch = shouldSearch ? normalizedSearch : "";
  const queryKey = [
    ws.id,
    project.id,
    "task",
    task.id,
    "users",
    "user-add",
    actualSearch,
  ];
  const users = useInfiniteQuery({
    queryKey,
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) =>
      await getUsersToAdd({
        workspaceId: ws.id,
        projectId: project.id,
        taskId: task.id,
        search: actualSearch,
        cursor: pageParam,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const addUsers = useMutation({
    mutationFn: ({ users }: { users: taskCreateUsersProps[] }) =>
      addUsersToTask({
        workspaceId: ws.id,
        projectId: project.id,
        taskId: task.id,
        users,
      }),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(getApiErrorMessage(error, "Failed to assign users"));
    },
    onSuccess: () => {
      toast.success("Users assigned successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [ws.id, project.id, "task", task.id, "users"],
      });
    },
  });
  return {
    ...users,
    addUsers,
  };
}
