import { wsUserProps, wsUserResPropsList } from "@/app/interfaces";
import {
  changeUserRoleCombined,
  combinedRoleChange,
} from "@/lib/axios/workspace/users/changeUserRole";
import { getUsersList } from "@/lib/axios/workspace/users/getUserList";
import { removeUserCombined } from "@/lib/axios/workspace/users/removeUser";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useCurrentWorkspace } from "../../../hooks/useCurrentWorkspace";
import { getListUserKey } from "@/lib/functions/workspace/user/getUsersKey";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { Dispatch, SetStateAction } from "react";
import { getApiErrorMessage } from "@/lib/functions/error/getApiErrorMessage";
import { AxiosError } from "axios";
import { ApiError } from "next/dist/server/api-utils";

export const useWsUserList = (
  page: number,
  setPage: Dispatch<SetStateAction<number>>,
  projectId?: string,
  taskId?: string,
  search?: string,
) => {
  const { id } = useCurrentWorkspace();
  const debouncedSearch = useDebounce(search, 300);
  const normalizedSearch = debouncedSearch?.trim() ?? "";
  const shouldSearch = normalizedSearch.length >= 2;
  const queryKey = getListUserKey(
    id,
    projectId,
    taskId,
    shouldSearch ? normalizedSearch : "",
    page,
  );
  const queryClient = useQueryClient();
  const usersQuery = useQuery<wsUserResPropsList>({
    queryKey,
    queryFn: async () =>
      await getUsersList({
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
      removeUserCombined({ workspaceId: id, userId, projectId, taskId }),
    onMutate: async ({ userId }: { userId: string }) => {
      await queryClient.cancelQueries({
        queryKey,
      });
      const previousData = queryClient.getQueriesData<wsUserResPropsList>({
        queryKey,
      });
      queryClient.setQueriesData<wsUserResPropsList>(
        { queryKey },
        (oldData: wsUserResPropsList | undefined) => {
          if (!oldData) return oldData;
          const updatedRequests = oldData.users.filter(
            (u: wsUserProps) => u.id === userId,
          );
          if (updatedRequests.length === 0 && page > 1) {
            setPage(page - 1);
          }
          return {
            ...oldData,
            users: oldData.users.filter(
              (user: wsUserProps) => user.id !== userId,
            ),
            total: oldData.total - 1,
          };
        },
      );
      return { previousData };
    },
    onError: (_err: AxiosError<ApiError>, _userId, context) => {
      context?.previousData?.forEach(
        ([key, data]: [readonly unknown[], wsUserResPropsList | undefined]) => {
          queryClient.setQueryData(key, data);
        },
      );
      toast.error(getApiErrorMessage(_err, "Failed to remove user"));
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [id, "users"],
      });
    },
  });
  const roleChangingMutation = useMutation({
    mutationFn: ({
      role,
      userId,
    }: {
      role: combinedRoleChange;
      userId: string;
    }) =>
      changeUserRoleCombined({
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
      role: combinedRoleChange;
      userId: string;
    }) => {
      await queryClient.cancelQueries({
        queryKey,
      });
      const previousData = queryClient.getQueriesData<wsUserResPropsList>({
        queryKey,
      });
      queryClient.setQueriesData<wsUserResPropsList>(
        {
          queryKey,
        },
        (oldData: wsUserResPropsList | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            users: oldData.users.map((u: wsUserProps) =>
              u.id === userId ? { ...u, role } : u,
            ),
          };
        },
      );
      return { previousData };
    },
    onError: (_err: AxiosError<ApiError>, _userId, context) => {
      context?.previousData?.forEach(
        ([key, data]: [readonly unknown[], wsUserResPropsList | undefined]) => {
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
