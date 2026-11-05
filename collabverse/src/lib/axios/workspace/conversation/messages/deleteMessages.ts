import { selectedMsgsProps } from "@/app/interfaces";
import api from "@/lib/axios";

export async function deleteMessages({
  workspaceId,
  conversationId,
  msgs,
  others,
}: {
  workspaceId: string;
  conversationId: string;
  msgs: selectedMsgsProps[];
  others: boolean;
}) {
  return await api.patch(
    `/api/workspace/${workspaceId}/conversation/${conversationId}/messages/delete`,
    {
      msgs,
      others,
    },
  );
}
