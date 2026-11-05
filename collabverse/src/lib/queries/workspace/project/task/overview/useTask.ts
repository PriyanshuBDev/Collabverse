import { taskEditProps, taskProps } from "@/app/interfaces";
import { getTask } from "@/lib/axios/workspace/project/tasks/getTask";
import { patchTask } from "@/lib/axios/workspace/project/tasks/patchTask";
import { getApiErrorMessage } from "@/lib/functions/error/getApiErrorMessage";
import { useCurrentProject } from "@/lib/hooks/useCurrentProject";
import { useCurrentTask } from "@/lib/hooks/useCurrentTask";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ApiError } from "next/dist/server/api-utils";
import { toast } from "sonner";

export function useTask() {
  const ws = useCurrentWorkspace();
  const project = useCurrentProject();
  const task = useCurrentTask();
  const queryKey = [ws.id, project.id, "task", task.id, "overview"];
  const queryClient = useQueryClient();
  const overViewQuery = useQuery({
    queryKey,
    queryFn: () =>
      getTask({ workspaceId: ws.id, projectId: project.id, taskId: task.id }),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!ws.id && !!project.id && !!task.id,
  });
  const editTask = useMutation({
    mutationFn: ({
      name,
      description,
      priority,
      status,
      dueDate,
    }: taskEditProps) =>
      patchTask({
        workspaceId: ws.id,
        projectId: project.id,
        taskId: task.id,
        name,
        description,
        dueDate,
        status,
        priority,
      }),
    onMutate: async ({
      name,
      description,
      priority,
      status,
      dueDate,
    }: taskEditProps) => {
      await queryClient.cancelQueries({ queryKey });
      const previousTask = queryClient.getQueryData<taskProps>(queryKey);
      if (previousTask) {
        queryClient.setQueryData<taskProps>(queryKey, {
          ...previousTask,
          name: name ?? previousTask.name,
          description:
            description !== undefined
              ? description !== null
                ? description
                : ""
              : previousTask.description,
          due: dueDate ?? previousTask.due,
          priority: priority ?? previousTask.priority,
          status: status ?? previousTask.status,
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
      toast.dismiss();
      toast.error(getApiErrorMessage(error, "Failed to edit task"));
    },
    onSuccess: (props) => {
      queryClient.setQueryData<taskProps>(queryKey, (current) =>
        current
          ? {
              ...current,
              name: props.name ?? current.name,
              description: props.description ?? current.description,
              due: props.dueDate ?? current.due,
              priority: props.priority ?? current.priority,
              status: props.status ?? current.status,
            }
          : current,
      );
      toast.success("Task details updated successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [ws.id, project.id, "tasks"] });
      queryClient.invalidateQueries({
        queryKey: [ws.id, project.id, "task", task.slug],
      });
    },
  });
  return {
    ...overViewQuery,
    editTask,
  };
}
