import { taskProps } from "@/app/interfaces";
import { createSubtask } from "@/lib/axios/workspace/project/tasks/subtasks/createSubtask";
import {
  ApiError,
  getApiErrorMessage,
} from "@/lib/functions/error/getApiErrorMessage";
import { useCurrentProject } from "@/lib/hooks/useCurrentProject";
import { useCurrentTask } from "@/lib/hooks/useCurrentTask";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export interface createSubtaskProps {
  name: string;
  description?: string;
}
export function useCreateSubtask() {
  const ws = useCurrentWorkspace();
  const project = useCurrentProject();
  const task = useCurrentTask();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, description }: createSubtaskProps) =>
      createSubtask({
        workspaceId: ws.id,
        projectId: project.id,
        taskId: task.id,
        name,
        description,
      }),
    onError: (e: AxiosError<ApiError>) => {
      toast.error(getApiErrorMessage(e, "Failed to create subtask"));
    },
    onSuccess: (subtask) => {
      toast.success("Subtask created successfully");
      queryClient.setQueryData<taskProps>(
        [ws.id, project.id, "task", task.id, "overview"],
        (current) =>
          current
            ? {
                ...current,
                subtasks: [subtask, ...(current.subtasks ?? [])],
              }
            : current,
      );
    },
  });
}
