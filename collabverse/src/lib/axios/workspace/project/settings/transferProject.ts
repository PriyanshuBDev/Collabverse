import api from "@/lib/axios";

export async function transferProject({
  workspaceId,
  projectId,
  newOwnerId,
}: {
  workspaceId: string;
  projectId: string;
  newOwnerId: string;
}) {
  return await api.patch(
    `/api/workspace/${workspaceId}/projects/${projectId}/settings/transfer`,
    {
      newOwnerId,
    },
  );
}
