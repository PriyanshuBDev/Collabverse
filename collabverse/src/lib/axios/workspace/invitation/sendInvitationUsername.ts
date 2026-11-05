import z from "zod";
import api from "../..";
import { wsRoleChange } from "../users/changeUserRole";
import { usernameWsInviteSchema } from "@/app/api/workspace/[id]/invitation/username/create/route";
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
