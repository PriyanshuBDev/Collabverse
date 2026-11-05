import { patchTaskStatus } from "@/lib/axios/workspace/project/tasks/patchTaskStatus";
import { patchPosition } from "@/lib/axios/workspace/project/tasks/view/patchPosition";
import {
  ApiError,
  getApiErrorMessage,
} from "@/lib/functions/error/getApiErrorMessage";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { TaskStatus } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export function useTaskChanges({ projectId }: { projectId: string }) {
  const ws = useCurrentWorkspace();
  const queryClient = useQueryClient();
  const moveMutation = useMutation({
    mutationFn: ({
      taskId,
      status,
      prevId,
      nextId,
    }: {
      taskId: string;
      status: TaskStatus;
      prevId?: string;
      nextId?: string;
    }) =>
      patchPosition({
        workspaceId: ws.id,
        projectId,
        taskId,
        status,
        prevId,
        nextId,
      }),
    onError: (_err, vars) => {
      queryClient.invalidateQueries({
        queryKey: [ws.id, projectId, "tasks", "board", vars.status],
      });
      toast.dismiss();
      toast.error("Failed move task");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [ws.id, projectId, "tasks", "board"],
      });
    },
  });
  const changeStatus = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      patchTaskStatus({
        workspaceId: ws.id,
        projectId,
        taskId,
        status,
      }),
    onError: (err: AxiosError<ApiError>) => {
      queryClient.invalidateQueries({
        queryKey: [ws.id, projectId, "tasks", "board"],
      });
      toast.dismiss();
      toast.error(getApiErrorMessage(err, "Failed to change task status"));
    },
    onSuccess: () => {
      toast.success("Task status successfully changed");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [ws.id, projectId, "tasks"],
      });
    },
  });
  return { moveMutation, changeStatus };
}
