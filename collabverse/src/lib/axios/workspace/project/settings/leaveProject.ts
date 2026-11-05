import api from "@/lib/axios";

export async function leaveProject({
  workspaceId,
  projectId,
}: {
  workspaceId: string;
  projectId: string;
}) {
  return await api.delete(
    `/api/workspace/${workspaceId}/projects/${projectId}/settings/leave`,
  );
}
