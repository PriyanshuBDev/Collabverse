import { getAroundMsgsResProps } from "@/app/interfaces";
import api from "@/lib/axios";

export async function getAroundMessages({
  workspaceId,
  conversationId,
  messageId,
}: {
  workspaceId: string;
  conversationId: string;
  messageId: string;
}) {
  const res = await api.get<getAroundMsgsResProps>(
    `/api/workspace/${workspaceId}/conversation/${conversationId}/messages`,
    {
      params: {
        around: messageId,
      },
    },
  );
  return res.data;
}
