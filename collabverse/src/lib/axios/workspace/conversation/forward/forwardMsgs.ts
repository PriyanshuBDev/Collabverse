import { selectedConvosProps, selectedMsgsProps } from "@/app/interfaces";
import api from "@/lib/axios";

export async function forwardMsgs({
  workspaceId,
  conversationId,
  msgs,
  convos,
}: {
  workspaceId: string;
  conversationId: string;
  msgs: selectedMsgsProps[];
  convos: selectedConvosProps[];
}) {
  return await api.post(
    `/api/workspace/${workspaceId}/conversation/${conversationId}/messages/forward`,
    {
      msgs,
      convos,
    },
  );
}
