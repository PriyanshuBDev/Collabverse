import api from "@/lib/axios";

export async function removeConversation({
  workspaceId,
  conversationId,
}: {
  workspaceId: string;
  conversationId: string;
}) {
  return api.patch(
    `/api/workspace/${workspaceId}/conversation/${conversationId}/remove`,
  );
}
