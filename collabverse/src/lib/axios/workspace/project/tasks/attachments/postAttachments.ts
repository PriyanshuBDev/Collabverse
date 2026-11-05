import { fileMetadata } from "@/app/interfaces";
import api from "@/lib/axios";

export async function postAttachments({
  workspaceId,
  projectId,
  taskId,
  files,
}: {
  workspaceId: string;
  projectId: string;
  taskId: string;
  files: fileMetadata[];
}) {
  await api.post(
    `/api/workspace/${workspaceId}/projects/${projectId}/tasks/${taskId}/attachments/upload`,
    {
      files,
    },
  );
}
