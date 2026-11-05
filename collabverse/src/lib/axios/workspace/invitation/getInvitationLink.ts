import z from "zod";
import api from "../..";
import { wsRoleChange } from "../users/changeUserRole";
import { WsRole } from "@prisma/client";

export const linkWsInviteSchema = z.object({
  maxUses: z.number().min(1).max(100),
  expireAt: z.coerce.date().optional(),
  role: z.enum([WsRole.Admin, WsRole.Member]),
});
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
