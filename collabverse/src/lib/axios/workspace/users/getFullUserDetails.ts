import { fullUserDetails } from "@/app/interfaces";
import api from "../..";

export async function getFullUserDetails({
  workspaceId,
  userId,
}: {
  workspaceId: string;
  userId: string;
}) {
  const res = await api.get<{ data: fullUserDetails }>(
    `/api/workspace/${workspaceId}/users/${userId}/`,
  );
  return res.data.data;
}
