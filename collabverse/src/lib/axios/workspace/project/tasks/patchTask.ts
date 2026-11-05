import { taskEditResProps } from "@/app/interfaces";
import api from "@/lib/axios";
import { Priority, TaskStatus } from "@prisma/client";

export interface patchTaskProps {
  workspaceId: string;
  projectId: string;
  taskId: string;
  name?: string;
  description?: string | null;
  priority?: Priority;
  status?: TaskStatus;
  dueDate?: Date;
}

export async function patchTask({
  workspaceId,
  projectId,
  priority,
  taskId,
  status,
  description,
  dueDate,
  name,
}: patchTaskProps) {
  const res = await api.patch<{ task: taskEditResProps }>(
    `/api/workspace/${workspaceId}/projects/${projectId}/tasks/${taskId}/edit`,
    {
      name,
      description,
      priority,
      status,
      dueDate,
    },
  );
  return res.data.task;
}
