import { chatListProps } from "@/app/interfaces";
import api from "@/lib/axios";

export async function getSingleConversation({
  workspaceId,
  conversationId,
}: {
  workspaceId: string;
  conversationId: string;
}) {
  const res = await api.get<{ conversation: chatListProps }>(
    `/api/workspace/${workspaceId}/conversation/sidebar/single`,
    {
      params: {
        conversationId,
      },
    },
  );
  return res.data;
}
