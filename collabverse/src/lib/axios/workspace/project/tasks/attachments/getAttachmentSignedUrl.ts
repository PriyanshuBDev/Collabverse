import api from "@/lib/axios";

export async function getAttachmentSignedUrl({
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
  const res = await api.get<{ url: string }>(
    `/api/workspace/${workspaceId}/projects/${projectId}/tasks/${taskId}/attachments/${attachmentId}/download`,
  );
  return res.data;
}
