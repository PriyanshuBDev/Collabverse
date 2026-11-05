import api from "@/lib/axios";

export async function deleteSingleAttachment({
  workspaceId,
  projectId,
  taskId,
  attachmentId,
}: {
  workspaceId: string;
  projectId: string;
  taskId: string;
  attachmentId: string;
}) {
  return await api.delete(
    `/api/workspace/${workspaceId}/projects/${projectId}/tasks/${taskId}/attachments/${attachmentId}/delete`,
  );
}
