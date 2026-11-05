import { wsJoinRequestsProps } from "@/app/interfaces";
import api from "../..";

export async function getJoinRequests(workspaceId: string, page: number) {
  const res = await api.get<wsJoinRequestsProps>(
    `/api/workspace/${workspaceId}/users/join-requests`,
    {
      params: {
        page,
      },
    },
  );
  return res.data;
}
