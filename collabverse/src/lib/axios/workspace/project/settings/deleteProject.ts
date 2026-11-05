import api from "../../..";

export async function deleteProject({
  workspaceId,
  projectId,
}: {
  workspaceId: string;
  projectId: string;
}) {
  await api.delete(
    `/api/workspace/${workspaceId}/projects/${projectId}/settings/delete`,
  );
}
