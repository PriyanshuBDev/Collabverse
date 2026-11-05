import { CompleteProjectProps } from "@/app/interfaces";
import { getProjectOverview } from "@/lib/axios/workspace/project/getProjectOverview";
import { patchProject } from "@/lib/axios/workspace/project/patchProject";
import {
  ApiError,
  getApiErrorMessage,
} from "@/lib/functions/error/getApiErrorMessage";
import { useCurrentProject } from "@/lib/hooks/useCurrentProject";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
export interface projectEditProps {
  name?: string;
  description?: string | null;
  dueDate?: Date | null;
  avatar?: File;
  avatarRemoved: boolean;
  oldAvatarPath?: string;
  oldAvatarUrl?: string;
}
export function useProjectOverview() {
  const { id } = useCurrentWorkspace();
  const project = useCurrentProject();
  const queryClient = useQueryClient();
  const queryKey = [id, "project", project.id, "overview"];
  const overViewQuery = useQuery({
    queryKey,
    queryFn: () => getProjectOverview(id, project.id),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!id && !!project.id,
  });
  const editDetails = useMutation({
    mutationFn: ({
      name,
      description,
      dueDate,
      avatar,
      avatarRemoved,
      oldAvatarPath,
      oldAvatarUrl,
    }: projectEditProps) =>
      patchProject({
        workspaceId: id,
        projectId: project.id,
        name,
        description,
        dueDate,
        avatarRemoved,
        avatar,
        oldAvatarPath,
        oldAvatarUrl,
      }),
    onMutate: async ({
      name,
      description,
      dueDate,
      avatarRemoved,
      avatar,
    }: projectEditProps) => {
      await queryClient.cancelQueries({
        queryKey,
      });
      const previousProject =
        queryClient.getQueryData<CompleteProjectProps>(queryKey);
      const previewUrl = avatar ? URL.createObjectURL(avatar) : undefined;
      if (previousProject) {
        queryClient.setQueryData<CompleteProjectProps>(queryKey, {
          ...previousProject,
          name: name ?? previousProject.name,
          description:
            description !== undefined
              ? description !== null
                ? description
                : ""
              : previousProject.description,
          dueDate: dueDate !== undefined ? dueDate : previousProject.dueDate,
          avatar: avatar
            ? previewUrl
            : avatarRemoved
              ? undefined
              : previousProject?.avatar,
          avatarPath: avatar
            ? undefined
            : avatarRemoved
              ? undefined
              : previousProject?.avatarPath,
        });
      }
      return {
        previewUrl,
        previousProject,
      };
    },
    onError: (error: AxiosError<ApiError>, _vars, ctx) => {
      if (ctx?.previousProject) {
        queryClient.setQueryData<CompleteProjectProps>(
          queryKey,
          ctx.previousProject,
        );
      }
      toast.error(getApiErrorMessage(error, "Failed to edit project"));
    },
    onSuccess: (props) => {
      queryClient.setQueryData<CompleteProjectProps>(queryKey, (current) =>
        current
          ? {
              ...current,
              avatar: props.avatar,
              avatarPath: props.avatarPath,
            }
          : current,
      );
      toast.success("Project details updated successfully");
    },
    onSettled: (_data, _err, _vars, ctx) => {
      if (ctx?.previewUrl) {
        URL.revokeObjectURL(ctx.previewUrl);
      }
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({
        queryKey: [id, "project", project.slug],
      });
      queryClient.invalidateQueries({ queryKey: [id, "projects"] });
      queryClient.invalidateQueries({ queryKey: [id, "users-filters"] });
      queryClient.invalidateQueries({
        queryKey: [id, "home", "recent-projects"],
      });
    },
  });

  return {
    ...overViewQuery,
    editDetails,
  };
}
