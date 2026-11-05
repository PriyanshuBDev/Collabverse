import { subTaskProps, taskProps } from "@/app/interfaces";
import { deleteSubtask } from "@/lib/axios/workspace/project/tasks/subtasks/deleteSubtask";
import { markSubtask } from "@/lib/axios/workspace/project/tasks/subtasks/markSubtask";
import { patchSubtask } from "@/lib/axios/workspace/project/tasks/subtasks/patchSubtask";
import { getApiErrorMessage } from "@/lib/functions/error/getApiErrorMessage";
import { useCurrentProject } from "@/lib/hooks/useCurrentProject";
import { useCurrentTask } from "@/lib/hooks/useCurrentTask";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ApiError } from "next/dist/server/api-utils";
import { toast } from "sonner";

export function usePatchSubtask(subtaskId: string) {
  const ws = useCurrentWorkspace();
  const project = useCurrentProject();
  const task = useCurrentTask();
  const queryClient = useQueryClient();
  const queryKey = [ws.id, project.id, "task", task.id, "overview"];
  const edit = useMutation({
    mutationFn: ({
      name,
      description,
    }: {
      name?: string;
      description?: string;
    }) =>
      patchSubtask({
        workspaceId: ws.id,
        projectId: project.id,
        taskId: task.id,
        subtaskId,
        name,
        description,
      }),
    onMutate: async ({
      name,
      description,
    }: {
      name?: string;
      description?: string;
    }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousTask = queryClient.getQueryData<taskProps>(queryKey);
      if (previousTask) {
        queryClient.setQueryData<taskProps>(queryKey, {
          ...previousTask,
          subtasks: previousTask.subtasks.map((s: subTaskProps) => {
            if (s.id === subtaskId) {
              return {
                ...s,
                name: name ?? s.name,
                description: description ?? s.description,
              };
            } else {
              return s;
            }
          }),
        });
      }
      return {
        previousTask,
      };
    },
    onError: (error: AxiosError<ApiError>, _vars, ctx) => {
      if (ctx?.previousTask) {
        queryClient.setQueryData<taskProps>(queryKey, ctx.previousTask);
      }
      toast.error(getApiErrorMessage(error, "Failed to edit subtask"));
    },
    onSuccess: () => {
      toast.success("Subtask details udated successfully");
    },
  });
  const mark = useMutation({
    mutationFn: ({ done }: { done: boolean }) =>
      markSubtask({
        workspaceId: ws.id,
        projectId: project.id,
        taskId: task.id,
        subtaskId,
        done,
      }),
    onMutate: async ({ done }: { done: boolean }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousTask = queryClient.getQueryData<taskProps>(queryKey);
      if (previousTask) {
        queryClient.setQueryData<taskProps>(queryKey, {
          ...previousTask,
          subtasks: previousTask.subtasks.map((s: subTaskProps) => {
            if (s.id === subtaskId) {
              return {
                ...s,
                done,
              };
            } else {
              return s;
            }
          }),
        });
      }
      return {
        previousTask,
      };
    },
    onError: (error: AxiosError<ApiError>, _vars, ctx) => {
      if (ctx?.previousTask) {
        queryClient.setQueryData<taskProps>(queryKey, ctx.previousTask);
      }
      toast.error(
        getApiErrorMessage(
          error,
          `Failed to ${_vars.done ? "mark" : "unmark"} subtask`,
        ),
      );
    },
    onSuccess: (data) => {
      queryClient.setQueryData<taskProps>(queryKey, (current) =>
        current
          ? {
              ...current,
              subtasks: current.subtasks.map((s: subTaskProps) => {
                if (subtaskId === s.id) {
                  return {
                    ...s,
                    markedBy: data.markedBy,
                    done: data.done,
                  };
                }
                return s;
              }),
            }
          : current,
      );
    },
  });
  const deleteMutation = useMutation({
    mutationFn: () =>
      deleteSubtask({
        workspaceId: ws.id,
        projectId: project.id,
        taskId: task.id,
        subtaskId,
      }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previousTask = queryClient.getQueryData<taskProps>(queryKey);
      if (previousTask) {
        queryClient.setQueryData<taskProps>(queryKey, {
          ...previousTask,
          subtasks: previousTask.subtasks.filter(
            (s: subTaskProps) => s.id === subtaskId,
          ),
        });
      }
      return {
        previousTask,
      };
    },
    onError: (error: AxiosError<ApiError>, _vars, ctx) => {
      if (ctx?.previousTask) {
        queryClient.setQueryData<taskProps>(queryKey, ctx.previousTask);
      }
      toast.error(getApiErrorMessage(error, `Failed to delete subtask`));
    },
    onSuccess: () => {
      toast.success("Subtask deleted successfully");
    },
  });
  return { edit, mark, deleteMutation };
}
