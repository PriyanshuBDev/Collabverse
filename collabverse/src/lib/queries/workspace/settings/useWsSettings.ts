import {
  WorkspaceSettingsProps,
  wsAdminPerm,
  wsPermissionState,
} from "@/app/interfaces";
import { deleteWs } from "@/lib/axios/workspace/settings/deleteWs";
import { getWsSetting } from "@/lib/axios/workspace/settings/getWsSetting";
import { leaveWs } from "@/lib/axios/workspace/settings/leaveWs";
import { patchWs } from "@/lib/axios/workspace/settings/patchWs";
import { togglePerms } from "@/lib/axios/workspace/settings/togglePerms";
import { transferWs } from "@/lib/axios/workspace/settings/transferWs";
import { wsRoleChange } from "@/lib/axios/workspace/users/changeUserRole";
import {
  ApiError,
  getApiErrorMessage,
} from "@/lib/functions/error/getApiErrorMessage";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { WsPermission } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export interface wsEditProps {
  name?: string;
  description?: string | null;
  avatar?: File;
  avatarRemoved: boolean;
  oldAvatarPath?: string;
  oldAvatarUrl?: string;
}
interface wsPermMutateProps {
  role: wsRoleChange;
  permission: WsPermission;
  enabled: boolean;
}
function updatePermission(
  state: wsPermissionState,
  wsRole: wsRoleChange,
  permission: WsPermission,
  enabled: boolean,
): wsPermissionState {
  const roleMap = {
    Member: "member",
    Admin: "admin",
  } as const;

  const role = roleMap[wsRole];
  if (enabled) {
    return {
      ...state,
      [role]: [...state[role], permission],
    };
  }

  return {
    ...state,
    [role]: state[role].filter((p: wsAdminPerm) => p !== permission),
  };
}
export function useWsSettings() {
  const { id, slug } = useCurrentWorkspace();
  const router = useRouter();
  const queryClient = useQueryClient();
  const queryKey = ["workspace", id, "setting"];
  const settingsQuery = useQuery({
    queryKey,
    queryFn: () => getWsSetting(id),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!id,
  });
  const editDetails = useMutation({
    mutationFn: ({
      name,
      description,
      avatar,
      avatarRemoved,
      oldAvatarPath,
      oldAvatarUrl,
    }: wsEditProps) =>
      patchWs({
        id,
        name,
        description,
        avatarRemoved,
        avatar,
        oldAvatarPath,
        oldAvatarUrl,
      }),
    onMutate: async ({
      name,
      description,
      avatarRemoved,
      avatar,
    }: wsEditProps) => {
      await queryClient.cancelQueries({
        queryKey,
      });
      const previousWs =
        queryClient.getQueryData<WorkspaceSettingsProps>(queryKey);
      const previewUrl = avatar ? URL.createObjectURL(avatar) : undefined;
      if (previousWs) {
        queryClient.setQueryData<WorkspaceSettingsProps>(queryKey, {
          ...previousWs,
          name: name ?? previousWs.name,
          description:
            description !== undefined
              ? description !== null
                ? description
                : ""
              : previousWs.description,
          avatar: avatar
            ? previewUrl
            : avatarRemoved
              ? undefined
              : previousWs?.avatar,
          avatarPath: avatar
            ? undefined
            : avatarRemoved
              ? undefined
              : previousWs?.avatarPath,
        });
      }
      return {
        previewUrl,
        previousWs,
      };
    },
    onError: (error: AxiosError<ApiError>, _vars, ctx) => {
      if (ctx?.previousWs) {
        queryClient.setQueryData<WorkspaceSettingsProps>(
          queryKey,
          ctx.previousWs,
        );
      }
      toast.error(getApiErrorMessage(error, "Failed to edit workspace"));
    },
    onSuccess: (props) => {
      queryClient.setQueryData<WorkspaceSettingsProps>(queryKey, (current) =>
        current
          ? {
              ...current,
              avatar: props.avatar,
              avatarPath: props.avatarPath,
            }
          : current,
      );
      toast.success("Workspace details updated successfully");
    },
    onSettled: (_data, _err, _vars, ctx) => {
      if (ctx?.previewUrl) {
        URL.revokeObjectURL(ctx.previewUrl);
      }
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({
        queryKey: ["workspace", slug],
      });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
  const togglePerm = useMutation({
    mutationFn: ({ role, permission, enabled }: wsPermMutateProps) =>
      togglePerms({
        id,
        role,
        permission,
        enabled,
      }),
    onMutate: async ({ role, permission, enabled }: wsPermMutateProps) => {
      await queryClient.cancelQueries({ queryKey });
      const previousWs =
        queryClient.getQueryData<WorkspaceSettingsProps>(queryKey);
      if (previousWs) {
        queryClient.setQueryData<WorkspaceSettingsProps>(queryKey, {
          ...previousWs,
          permissions: updatePermission(
            previousWs.permissions,
            role,
            permission,
            enabled,
          ),
        });
      }
      return {
        previousWs,
      };
    },
    onError: (error: AxiosError<ApiError>, _vars, ctx) => {
      if (ctx?.previousWs) {
        queryClient.setQueryData<WorkspaceSettingsProps>(
          queryKey,
          ctx.previousWs,
        );
      }
      toast.error(
        getApiErrorMessage(
          error,
          `Failed to update ${_vars.permission} permission`,
        ),
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
  const transfer = useMutation({
    mutationFn: ({ newOwnerId }: { newOwnerId: string }) =>
      transferWs({ id, newOwnerId }),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(
        getApiErrorMessage(error, "Failed to transfer workspace ownership"),
      );
    },
    onSuccess: () => {
      toast.success("Workspace ownership transferred successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
  const leave = useMutation({
    mutationFn: () => leaveWs(id),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(getApiErrorMessage(error, "Failed to leave workspace"));
    },
    onSuccess: () => {
      toast.success("Successfully left the workspace");
      router.push(`/app`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: [id] });
    },
  });
  const deleteWorkspace = useMutation({
    mutationFn: () => deleteWs({ workspaceId: id }),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(getApiErrorMessage(error, "Failed to delete workspace"));
    },
    onSuccess: () => {
      toast.success("Successfully deleted the workspace");
      router.push(`/app`);
    },
  });
  return {
    ...settingsQuery,
    editDetails,
    togglePerm,
    leave,
    transfer,
    deleteWorkspace,
  };
}
