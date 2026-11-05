import api from "@/lib/axios";

export async function removeGroupUser({
  workspaceId,
  conversationId,
  userId,
}: {
  workspaceId: string;
  conversationId: string;
  userId: string;
}) {
  return await api.patch(
    `/api/workspace/${workspaceId}/conversation/${conversationId}/group/users/${userId}/remove`,
  );
}
