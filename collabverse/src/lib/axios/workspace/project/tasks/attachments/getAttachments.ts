import { getAttachmentsRes } from "@/app/interfaces";
import api from "@/lib/axios";

export async function getAttachments({
  workspaceId,
  projectId,
  taskId,
  cursorCreatedAt,
  cursorId,
}: {
  workspaceId: string;
  projectId: string;
  taskId: string;
  cursorId?: string;
  cursorCreatedAt?: Date;
}) {
  const res = await api.get<getAttachmentsRes>(
    `/api/workspace/${workspaceId}/projects/${projectId}/tasks/${taskId}/attachments`,
    {
      params: {
        cursorId,
        cursorCreatedAt,
      },
    },
  );
  return res.data;
}
