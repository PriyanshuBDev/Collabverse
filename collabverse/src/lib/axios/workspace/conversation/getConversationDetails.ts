import { convoDetailsProps } from "@/app/interfaces";
import api from "../..";

export async function getConversationDetails({
  workspaceId,
  conversationId,
}: {
  workspaceId: string;
  conversationId: string;
}) {
  const res = await api.get<{ conversation: convoDetailsProps }>(
    `/api/workspace/${workspaceId}/conversation/${conversationId}/details`,
  );
  return res.data.conversation;
}
