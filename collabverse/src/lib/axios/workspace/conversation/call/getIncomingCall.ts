import { memberProps } from "@/app/interfaces";
import api from "@/lib/axios";

export async function getIncomingCall({
  workspaceId,
  callId,
}: {
  workspaceId: string;
  callId: string;
}) {
  const res = await api.get<{ user: memberProps }>(
    `/api/workspace/${workspaceId}/call/${callId}/user-details`,
  );
  return res.data;
}
