import { getInfiniteMsgsResProps } from "@/app/interfaces";
import api from "@/lib/axios";

export async function getInfiniteMessages({
  workspaceId,
  conversationId,
  top,
  bottom,
}: {
  workspaceId: string;
  conversationId: string;
  top?: string;
  bottom?: string;
}) {
  const res = await api.get<getInfiniteMsgsResProps>(
    `/api/workspace/${workspaceId}/conversation/${conversationId}/messages`,
    {
      params: {
        top,
        bottom,
      },
    },
  );
  return res.data;
}
