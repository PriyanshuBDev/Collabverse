import { idAndSlug, taskCreateUsersProps } from "@/app/interfaces";
import api from "@/lib/axios";
import { Priority, TaskStatus } from "@prisma/client";

export async function createTask({
  workspaceId,
  name,
  priority,
  projectId,
  users,
  dueDate,
  description,
  status,
}: {
  workspaceId: string;
  projectId: string;
  name: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: Date;
  description?: string;
  users?: taskCreateUsersProps[];
}) {
  const res = await api.post<idAndSlug>(
    `/api/workspace/${workspaceId}/projects/${projectId}/tasks/create`,
    {
      name,
      status,
      priority,
      description,
      dueDate,
      users,
    },
  );
  return res.data;
}
