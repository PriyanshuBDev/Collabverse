import {
  projectPermissionState,
  projectSlugProps,
} from "@/lib/axios/workspace/project/getCurrentProject";
import { deleteProject } from "@/lib/axios/workspace/project/settings/deleteProject";
import { leaveProject } from "@/lib/axios/workspace/project/settings/leaveProject";
import { toggleProjectPerm } from "@/lib/axios/workspace/project/settings/toggleProjectPerm";
import { transferProject } from "@/lib/axios/workspace/project/settings/transferProject";
import { projectRoleChange } from "@/lib/axios/workspace/project/users/roleChangeProjectUser";
import {
  ApiError,
  getApiErrorMessage,
} from "@/lib/functions/error/getApiErrorMessage";
import { useCurrentProject } from "@/lib/hooks/useCurrentProject";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { PPermission } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface projectPermMutateProps {
  role: projectRoleChange;
  permission: PPermission;
  enabled: boolean;
}
function updatePermission(
  state: projectPermissionState,
  projectRole: projectRoleChange,
  permission: PPermission,
  enabled: boolean,
): projectPermissionState {
  const roleMap = {
    Manager: "manager",
    Contributor: "contributor",
    Viewer: "viewer",
  } as const;

  const role = roleMap[projectRole];
  if (enabled) {
    return {
      ...state,
      [role]: [...state[role], permission],
    };
  }

  return {
    ...state,
    [role]: state[role].filter(
      (p: "Invite" | "Remove_Member" | "Comment" | "Edit_Project_Details") =>
        p !== permission,
    ),
  };
}
export function useProjectSettings() {
  const ws = useCurrentWorkspace();
  const { id, slug } = useCurrentProject();
  const queryClient = useQueryClient();
  const queryKey = [ws.id, "project", id, "overview"]; //Project settings will use data from overview as settings needs data that overview already has
  const router = useRouter();

  const togglePerm = useMutation({
    mutationFn: ({ role, permission, enabled }: projectPermMutateProps) =>
      toggleProjectPerm({
        workspaceId: ws.id,
        projectId: id,
        role,
        permission,
        enabled,
      }),
    onMutate: async ({ role, permission, enabled }: projectPermMutateProps) => {
      await queryClient.cancelQueries({ queryKey: [ws.id, "project", slug] });
      const previousProject = queryClient.getQueryData<projectSlugProps>([
        ws.id,
        "project",
        slug,
      ]);
      if (previousProject) {
        queryClient.setQueryData<projectSlugProps>([ws.id, "project", slug], {
          ...previousProject,
          permissions: updatePermission(
            previousProject.permissions,
            role,
            permission,
            enabled,
          ),
        });
      }
      return {
        previousProject,
      };
    },
    onError: (error: AxiosError<ApiError>, _vars, ctx) => {
      if (ctx?.previousProject) {
        queryClient.setQueryData<projectSlugProps>(
          [ws.id, "project", slug],
          ctx.previousProject,
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
      queryClient.invalidateQueries({ queryKey: [ws.id, "project", slug] });
    },
  });
  const transfer = useMutation({
    mutationFn: ({ newOwnerId }: { newOwnerId: string }) =>
      transferProject({ workspaceId: ws.id, projectId: id, newOwnerId }),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(
        getApiErrorMessage(error, "Failed to transfer project ownership"),
      );
    },
    onSuccess: () => {
      toast.success("Ownership transferred successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [ws.id, "project", slug] });
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: [ws.id, "projects"] });
    },
  });
  const leave = useMutation({
    mutationFn: () => leaveProject({ workspaceId: ws.id, projectId: id }),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(getApiErrorMessage(error, "Failed to leave project"));
    },
    onSuccess: () => {
      toast.success("Successfully left the project");
      router.push(`/app/${ws.slug}/projects`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [ws.id, "project", slug] });
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: [ws.id, "projects"] });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: () => deleteProject({ workspaceId: ws.id, projectId: id }),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(getApiErrorMessage(error, "Failed to delete project"));
    },
    onSuccess: () => {
      toast.success("Successfully deleted the project");
      router.push(`/app/${ws.slug}/projects`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [ws.id, "project", slug] });
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: [ws.id, "projects"] });
    },
  });
  return {
    togglePerm,
    transfer,
    leave,
    deleteMutation,
  };
}
