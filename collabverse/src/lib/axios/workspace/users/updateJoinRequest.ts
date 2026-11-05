import z from "zod";
import api from "../..";
import { joinRequestSchema } from "@/app/api/workspace/[id]/users/join-requests/[reqId]/route";
export type joinReqStatus = z.infer<typeof joinRequestSchema>["status"];
export async function updateJoinRequest({
  workspaceId,
  reqId,
  status,
}: {
  workspaceId: string;
  reqId: string;
  status: joinReqStatus;
}) {
  return await api.patch(
    `/api/workspace/${workspaceId}/users/join-requests/${reqId}`,
    {
      status,
    },
  );
}
