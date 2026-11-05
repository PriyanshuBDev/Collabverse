import { basicMember } from "@/app/interfaces";
import api from "@/lib/axios";
export interface markSubtaskProps {
  markedBy: basicMember;
  done: boolean;
}
export async function markSubtask({
  workspaceId,
  projectId,
  taskId,
  subtaskId,
  done,
}: {
  workspaceId: string;
  projectId: string;
  taskId: string;
  subtaskId: string;
  done: boolean;
}) {
  const res = await api.patch<markSubtaskProps>(
    `/api/workspace/${workspaceId}/projects/${projectId}/tasks/${taskId}/subtasks/${subtaskId}/mark`,
    {
      done,
    },
  );
  return res.data;
}
