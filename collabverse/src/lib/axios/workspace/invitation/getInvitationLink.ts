import z from "zod";
import api from "../..";
import { wsRoleChange } from "../users/changeUserRole";
import { linkWsInviteSchema } from "@/app/api/workspace/[id]/invitation/link/create/route";

export type InvitationLinkProps = z.infer<typeof linkWsInviteSchema>;
export async function getInvitationLink({
  workspaceId,
  role,
  maxUses,
  expireAt,
}: {
  workspaceId: string;
  role: wsRoleChange;
  maxUses: number;
  expireAt?: Date;
}) {
  const data: InvitationLinkProps = {
    expireAt,
    role,
    maxUses,
  };
  const res = await api.post<{ inviteUrl: string }>(
    `/api/workspace/${workspaceId}/invitation/link/create`,
    {
      ...data,
    },
  );
  return res.data.inviteUrl;
}
