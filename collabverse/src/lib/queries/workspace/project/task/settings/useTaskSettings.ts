import { deleteTask } from "@/lib/axios/workspace/project/tasks/deleteTask";
import { leaveTask } from "@/lib/axios/workspace/project/tasks/users/leaveTask";
import {
  ApiError,
  getApiErrorMessage,
} from "@/lib/functions/error/getApiErrorMessage";
import { goBack } from "@/lib/functions/helper/goBack";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useTaskSettings = () => {
  const { id: workspaceId, slug } = useCurrentWorkspace();
  const router = useRouter();
  const deleteMutation = useMutation({
    mutationFn: ({
      projectId,
      taskId,
    }: {
      projectId: string;
      taskId: string;
      shouldRoute: boolean;
      projectSlug: string;
    }) => deleteTask({ workspaceId, projectId, taskId }),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(getApiErrorMessage(error, "Failed to delete task"));
    },
    onSuccess: (_d, v) => {
      toast.success("Successfully deleted the task");
      if (v.shouldRoute) {
        goBack(router, `/api/${slug}/projects/${v.projectSlug}/`);
      }
    },
  });
  const leave = useMutation({
    mutationFn: ({
      projectId,
      taskId,
    }: {
      projectId: string;
      taskId: string;
      shouldRoute: boolean;
      projectSlug: string;
    }) => leaveTask({ workspaceId, projectId, taskId }),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(getApiErrorMessage(error, "Failed to leave task"));
    },
    onSuccess: (_d, v) => {
      toast.success("Successfully left the task");
      if (v.shouldRoute) {
        goBack(router, `/api/${slug}/projects/${v.projectSlug}`);
      }
    },
  });
  return {
    deleteMutation,
    leave,
  };
};
