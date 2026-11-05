import api from "@/lib/axios";
import { CallStatus } from "@prisma/client";

export async function updateCallStatus({
  workspaceId,
  callId,
  conversationId,
  status,
}: {
  workspaceId: string;
  conversationId: string;
  callId: string;
  status: CallStatus;
}) {
  return await api.patch(
    `/api/workspace/${workspaceId}/conversation/${conversationId}/call/${callId}/status`,
    {
      status,
    },
  );
}
