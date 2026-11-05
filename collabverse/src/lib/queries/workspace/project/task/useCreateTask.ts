import { idAndSlug, taskCreateUsersProps } from "@/app/interfaces";
import { createTask } from "@/lib/axios/workspace/project/tasks/createTask";
import {
  ApiError,
  getApiErrorMessage,
} from "@/lib/functions/error/getApiErrorMessage";

import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { Priority, TaskStatus } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
export interface createTaskProps {
  name: string;
  status: TaskStatus;
  priority: Priority;
  desc?: string;
  dueDate: Date;
  project: idAndSlug;
  users?: taskCreateUsersProps[];
}
export const useCreateTask = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const ws = useCurrentWorkspace();
  const mutation = useMutation({
    mutationFn: (props: createTaskProps) =>
      createTask({
        workspaceId: ws.id,
        projectId: props.project.id,
        ...props,
        description: props.desc,
      }),
    onError: (e: AxiosError<ApiError>) => {
      toast.error(getApiErrorMessage(e, "Failed to create task"));
    },
    onSuccess: (task, vars) => {
      toast.success("Task created successfully");
      router.push(
        `/app/${ws.slug}/projects/${vars.project.slug}/tasks/${task.slug}`,
      );
    },
    onSettled: (_d, _e, vars) => {
      queryClient.invalidateQueries({
        queryKey: [ws.id, vars.project.id, "tasks"],
      });
    },
  });
  return {
    createTask: mutation.mutate,
    isCreating: mutation.isPending,
  };
};
