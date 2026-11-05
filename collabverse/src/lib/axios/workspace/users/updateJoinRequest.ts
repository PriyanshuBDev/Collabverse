import z from "zod";
import api from "../..";
export const joinRequestSchema = z.object({
  status: z.enum(["Approved", "Rejected"]),
});
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
