import api from "../..";

export async function deleteWs({ workspaceId }: { workspaceId: string }) {
  await api.delete(`/api/workspace/${workspaceId}/settings/delete`);
}
