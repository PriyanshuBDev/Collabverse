import z from "zod";
import api from "../..";
import { wsRoleChange } from "../users/changeUserRole";
import { usernameSchema } from "@/lib/functions/route/usernameSchema";
import { WsRole } from "@prisma/client";
export const usernameWsInviteSchema = z.object({
  username: usernameSchema,
  expireAt: z.coerce.date().optional(),
  role: z.enum([WsRole.Admin, WsRole.Member]),
});
type usernameInviationProps = z.infer<typeof usernameWsInviteSchema>;
export async function sendInvitationUsername({
  workspaceId,
  username,
  role,
  expireAt,
}: {
  workspaceId: string;
  username: string;
  role: wsRoleChange;
  expireAt?: Date;
}) {
  const data: usernameInviationProps = {
    username,
    role,
    expireAt,
  };
  return await api.post(
    `/api/workspace/${workspaceId}/invitation/username/create`,
    {
      ...data,
    },
  );
}
