import { projectUserProps, projectUserResPropsList } from "@/app/interfaces";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useCurrentWorkspace } from "../../../../hooks/useCurrentWorkspace";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { Dispatch, SetStateAction } from "react";
import { getApiErrorMessage } from "@/lib/functions/error/getApiErrorMessage";
import { AxiosError } from "axios";
import { ApiError } from "next/dist/server/api-utils";
import { getListProjectUserKey } from "@/lib/functions/project/user/getProjectUsersKey";
import { getProjectUsersList } from "@/lib/axios/workspace/project/users/getProjectUsersList";
import { projectTaskRemoveUser } from "@/lib/axios/workspace/project/users/removeProjectUser";
import {
  projectTaskRole,
  projectTaskRoleChange,
} from "@/lib/axios/workspace/project/users/roleChangeProjectUser";

export const useProjectUserList = (
  page: number,
  setPage: Dispatch<SetStateAction<number>>,
  projectId: string,
  taskId?: string,
  search?: string,
) => {
  const { id } = useCurrentWorkspace();
  const debouncedSearch = useDebounce(search, 300);
  const normalizedSearch = debouncedSearch?.trim() ?? "";
  const shouldSearch = normalizedSearch.length >= 2;
  const queryKey = getListProjectUserKey(
    id,
    projectId,
    taskId,
    shouldSearch ? normalizedSearch : "",
    page,
  );
  const queryClient = useQueryClient();
  const usersQuery = useQuery<projectUserResPropsList>({
    queryKey,
    queryFn: async () =>
      await getProjectUsersList({
        workspaceId: id,
        projectId,
        taskId,
        page,
        search: shouldSearch ? normalizedSearch : "",
      }),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
  const removingMutation = useMutation({
    mutationFn: ({ userId }: { userId: string }) =>
      projectTaskRemoveUser({ workspaceId: id, userId, projectId, taskId }),
    onMutate: async ({ userId }: { userId: string }) => {
      await queryClient.cancelQueries({
        queryKey,
      });
      const previousData = queryClient.getQueriesData<projectUserResPropsList>({
        queryKey,
      });
      queryClient.setQueriesData<projectUserResPropsList>(
        { queryKey },
        (oldData: projectUserResPropsList | undefined) => {
          if (!oldData) return oldData;
          const updatedRequests = oldData.users.filter(
            (u: projectUserProps) => u.id === userId,
          );
          if (updatedRequests.length === 0 && page > 1) {
            setPage(page - 1);
          }
          return {
            ...oldData,
            users: oldData.users.filter(
              (user: projectUserProps) => user.id !== userId,
            ),
            total: oldData.total - 1,
          };
        },
      );
      return { previousData };
    },
    onError: (_err: AxiosError<ApiError>, _userId, context) => {
      context?.previousData?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      toast.error(getApiErrorMessage(_err, "Failed to remove user"));
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [id, "users"],
      });
    },
  });
  const roleChangingMutation = useMutation({
    mutationFn: ({ role, userId }: { role: projectTaskRole; userId: string }) =>
      projectTaskRoleChange({
        role,
        userId,
        workspaceId: id,
        projectId,
        taskId,
      }),
    onMutate: async ({
      role,
      userId,
    }: {
      role: projectTaskRole;
      userId: string;
    }) => {
      await queryClient.cancelQueries({
        queryKey,
      });
      const previousData = queryClient.getQueriesData<projectUserResPropsList>({
        queryKey,
      });
      queryClient.setQueriesData<projectUserResPropsList>(
        {
          queryKey,
        },
        (oldData: projectUserResPropsList | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            users: oldData.users.map((u: projectUserProps) =>
              u.id === userId ? { ...u, role } : u,
            ),
          };
        },
      );
      return { previousData };
    },
    onError: (_err: AxiosError<ApiError>, _userId, context) => {
      context?.previousData?.forEach(
        ([key, data]: [
          readonly unknown[],
          projectUserResPropsList | undefined,
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
        queryKey: [id, "users"],
      });
    },
  });
  return {
    ...usersQuery,
    removeUser: removingMutation.mutate,
    removeError: removingMutation.isError,
    removing: removingMutation.isPending,
    changeRole: roleChangingMutation.mutate,
    changeRoleError: roleChangingMutation.isError,
    changingRole: roleChangingMutation.isPending,
  };
};
