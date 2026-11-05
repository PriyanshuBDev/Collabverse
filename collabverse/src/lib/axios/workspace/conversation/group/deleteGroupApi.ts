import api from "@/lib/axios";

export async function deleteGroupApi({
  workspaceId,
  conversationId,
}: {
  workspaceId: string;
  conversationId: string;
}) {
  return await api.delete(
    `/api/workspace/${workspaceId}/conversation/${conversationId}/group/delete`,
  );
}
