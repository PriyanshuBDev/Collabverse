import { taskUserProps, taskUserResProps } from "@/app/interfaces";
import { getTaskUsers } from "@/lib/axios/workspace/project/tasks/users/getTaskUsers";
import { removeTaskUser } from "@/lib/axios/workspace/project/tasks/users/removeTaskUser";
import { roleChangeTaskUser } from "@/lib/axios/workspace/project/tasks/users/roleChangeTaskUser";
import { getApiErrorMessage } from "@/lib/functions/error/getApiErrorMessage";
import { useCurrentProject } from "@/lib/hooks/useCurrentProject";
import { useCurrentTask } from "@/lib/hooks/useCurrentTask";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useSearch } from "@/lib/hooks/useSearch";
import { TaskRole } from "@prisma/client";
import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ApiError } from "next/dist/server/api-utils";
import { toast } from "sonner";

export function useTaskUsers(search?: string) {
  const ws = useCurrentWorkspace();
  const project = useCurrentProject();
  const task = useCurrentTask();
  const queryClient = useQueryClient();
  const actualSearch = useSearch(search);
  const queryKey = [
    ws.id,
    project.id,
    "task",
    task.id,
    "users",
    actualSearch ?? "",
  ];
  const users = useInfiniteQuery({
    queryKey,
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) =>
      await getTaskUsers({
        workspaceId: ws.id,
        projectId: project.id,
        taskId: task.id,
        cursor: pageParam,
        search: actualSearch,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const remove = useMutation({
    mutationFn: ({ userId }: { userId: string }) =>
      removeTaskUser({
        userId,
        workspaceId: ws.id,
        projectId: project.id,
        taskId: task.id,
      }),
    onMutate: async ({ userId }: { userId: string }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueriesData<
        InfiniteData<taskUserResProps>
      >({ queryKey });
      queryClient.setQueriesData<InfiniteData<taskUserResProps>>(
        { queryKey },
        (oldData: InfiniteData<taskUserResProps, unknown> | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: taskUserResProps) => ({
              ...page,
              users: page.users.filter((u: taskUserProps) => u.id !== userId),
            })),
          };
        },
      );
      return { previousData };
    },
    onError: (_err: AxiosError<ApiError>, _userId, context) => {
      context?.previousData.forEach(
        ([key, data]: [
          readonly unknown[],
          InfiniteData<taskUserResProps, unknown> | undefined,
        ]) => {
          queryClient.setQueryData(key, data);
        },
      );
      toast.error(getApiErrorMessage(_err, "Failed to remove user"));
    },
    onSuccess: () => {
      toast.success("User removed successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [ws.id, project.id, "task", task.id, "users"],
      });
    },
  });
  const roleChange = useMutation({
    mutationFn: ({ role, userId }: { role: TaskRole; userId: string }) =>
      roleChangeTaskUser({
        role,
        userId,
        workspaceId: ws.id,
        projectId: project.id,
        taskId: task.id,
      }),
    onMutate: async ({ role, userId }: { role: TaskRole; userId: string }) => {
      await queryClient.cancelQueries({ queryKey });
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueriesData<
        InfiniteData<taskUserResProps>
      >({ queryKey });
      queryClient.setQueriesData<InfiniteData<taskUserResProps>>(
        { queryKey },
        (oldData: InfiniteData<taskUserResProps, unknown> | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: taskUserResProps) => ({
              ...page,
              users: page.users.map((user: taskUserProps) =>
                user.id === userId ? { ...user, role: role } : user,
              ),
            })),
          };
        },
      );
      return { previousData };
    },
    onError: (_err: AxiosError<ApiError>, _userId, context) => {
      context?.previousData.forEach(
        ([key, data]: [
          readonly unknown[],
          InfiniteData<taskUserResProps, unknown> | undefined,
        ]) => {
          queryClient.setQueryData(key, data);
        },
      );
      toast.error(getApiErrorMessage(_err, "Failed to change user role"));
    },
    onSuccess: () => {
      toast.success("User role changed successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [ws.id, project.id, "task", task.id, "users"],
      });
    },
  });
  return {
    ...users,
    remove,
    roleChange,
  };
}
