import { GroupData } from "@/app/interfaces";
import { getGroupData } from "@/lib/axios/workspace/conversation/group/getGroupData";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMuteMutation } from "../useMuteMutation";
import { updateGroupDetails } from "@/lib/axios/workspace/conversation/group/updateGroupDetails";
import { AxiosError } from "axios";
import {
  ApiError,
  getApiErrorMessage,
} from "@/lib/functions/error/getApiErrorMessage";
import { toast } from "sonner";
import { GroupPerm } from "@prisma/client";
import { toggleGroupPerm } from "@/lib/axios/workspace/conversation/group/toggleGroupPerm";
import { leaveGroup } from "@/lib/axios/workspace/conversation/group/leaveGroup";
import { useRouter } from "next/navigation";
import { deleteGroupApi } from "@/lib/axios/workspace/conversation/group/deleteGroupApi";
export interface groupEditProps {
  name?: string;
  description?: string | null;
  avatar?: File;
  avatarRemoved?: boolean;
  oldAvatarPath?: string;
  oldAvatarUrl?: string;
}
type permMutateProps = {
  perm: GroupPerm;
  enabled: boolean;
};
const toastMsg = ({ name, description }: groupEditProps) => {
  const isNameEdited = !!name;
  const isDescriptionEdited = !!description;
  return `${isNameEdited ? "name" : isDescriptionEdited ? "description" : "avatar"}`;
};
function changePerm(oldPerms: GroupPerm[], perm: GroupPerm, enabled: boolean) {
  const perms = new Set(oldPerms);

  if (enabled) {
    perms.add(perm);
  } else {
    perms.delete(perm);
  }

  return [...perms];
}
type props = {
  name: string;
};

export function useGroupData(conversationId: string) {
  const { id: workspaceId, slug } = useCurrentWorkspace();
  const queryClient = useQueryClient();
  const router = useRouter();
  const queryKey = [workspaceId, "conversation", conversationId, "group-data"];
  const groupData = useQuery({
    queryKey,
    queryFn: () =>
      getGroupData({
        workspaceId,
        conversationId,
      }),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!workspaceId && !!conversationId,
  });
  const handleMute = useMuteMutation<GroupData>(
    queryKey,
    groupData.data?.name ?? "Unknown",
    conversationId,
  );
  const editDetails = useMutation({
    mutationFn: ({
      name,
      description,
      avatar,
      avatarRemoved,
      oldAvatarPath,
      oldAvatarUrl,
    }: groupEditProps) =>
      updateGroupDetails({
        workspaceId,
        conversationId,
        description,
        name,
        oldAvatarPath,
        oldAvatarUrl,
        avatarRemoved,
        avatar,
      }),
    onMutate: async ({ name, description, avatarRemoved, avatar }) => {
      await queryClient.cancelQueries({
        queryKey,
      });
      const previousGroup = queryClient.getQueryData<GroupData>(queryKey);
      const previewUrl = avatar ? URL.createObjectURL(avatar) : undefined;
      if (previousGroup) {
        queryClient.setQueryData<GroupData>(queryKey, {
          ...previousGroup,
          name: name ?? previousGroup.name,
          description:
            description !== undefined
              ? description !== null
                ? description
                : ""
              : previousGroup.description,

          avatar: avatar
            ? previewUrl
            : avatarRemoved
              ? undefined
              : previousGroup?.avatar,
          avatarPath: avatar
            ? undefined
            : avatarRemoved
              ? undefined
              : previousGroup?.avatarPath,
        });
      }
      return {
        previewUrl,
        previousGroup,
      };
    },
    onError: (e: AxiosError<ApiError>, v, ctx) => {
      if (ctx?.previousGroup) {
        queryClient.setQueryData<GroupData>(queryKey, ctx.previousGroup);
      }
      toast.error(
        getApiErrorMessage(e, `Failed to edit group's ${toastMsg(v)}`),
      );
    },
    onSuccess: (props, v) => {
      queryClient.setQueryData<GroupData>(queryKey, (current) =>
        current
          ? {
              ...current,
              avatar: props.avatar,
              avatarPath: props.avatarPath,
            }
          : current,
      );
      toast.success(`Group's ${toastMsg(v)} edited successfully`);
    },
    onSettled: (_data, _err, _vars, ctx) => {
      if (ctx?.previewUrl) {
        URL.revokeObjectURL(ctx.previewUrl);
      }
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({
        queryKey: [workspaceId, "conversation", conversationId, "details"],
      });
    },
  });
  const togglePerm = useMutation({
    mutationFn: ({ perm, enabled }: permMutateProps) =>
      toggleGroupPerm({
        workspaceId,
        conversationId,
        permission: perm,
        enabled,
      }),

    onMutate: async ({ perm, enabled }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousProject = queryClient.getQueryData<GroupData>(queryKey);
      if (previousProject) {
        queryClient.setQueryData<GroupData>(queryKey, {
          ...previousProject,
          permissions: changePerm(previousProject.permissions, perm, enabled),
        });
      }
      return {
        previousProject,
      };
    },
    onError: (error: AxiosError<ApiError>, _vars, ctx) => {
      if (ctx?.previousProject) {
        queryClient.setQueryData<GroupData>(queryKey, ctx.previousProject);
      }
      toast.error(
        getApiErrorMessage(error, `Failed to update ${_vars.perm} permission`),
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
  const leave = useMutation({
    mutationFn: ({}: props) => leaveGroup({ workspaceId, conversationId }),
    onError: (error: AxiosError<ApiError>, v) => {
      toast.error(
        getApiErrorMessage(error, `Failed to leave group: ${v.name}`),
      );
    },
    onSuccess: (_d, v) => {
      toast.success(`Successfully left the group: ${v.name}`);
      router.push(`/app/${slug}/conversation`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [workspaceId, "conversations", "ids"],
      });
    },
  });
  const deleteGroupMutate = useMutation({
    mutationFn: ({}: props) => deleteGroupApi({ workspaceId, conversationId }),
    onError: (error: AxiosError<ApiError>, v) => {
      toast.error(
        getApiErrorMessage(error, `Failed to delete the group: ${v.name}`),
      );
    },
    onSuccess: (_d, v) => {
      toast.success(`Successfully deleted the group: ${v.name}`);
      router.push(`/app/${slug}/conversation`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [workspaceId, "conversations", "ids"],
      });
    },
  });
  return {
    ...groupData,
    handleMute,
    editDetails,
    leave,
    togglePerm,
    deleteGroupMutate,
  };
}
