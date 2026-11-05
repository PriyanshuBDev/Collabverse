import { userInvitationsProps } from "@/app/interfaces";
import api from "../..";

export async function getInvitations() {
  const res = await api.get<{ invitations: userInvitationsProps[] }>(
    `/api/user/invitations`,
  );
  return res.data.invitations;
}
