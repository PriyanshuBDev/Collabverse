import { chatPinProps } from "@/app/interfaces";
import api from "@/lib/axios";

export async function getPinnedMessages({
  workspaceId,
  conversationId,
}: {
  workspaceId: string;
  conversationId: string;
}) {
  const res = await api.get<{ pins: chatPinProps[] }>(
    `/api/workspace/${workspaceId}/conversation/${conversationId}/pin-message/messages`,
  );
  return res.data.pins;
}
