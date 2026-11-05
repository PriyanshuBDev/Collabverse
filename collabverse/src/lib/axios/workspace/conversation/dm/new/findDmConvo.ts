import { basicMember } from "@/app/interfaces";
import api from "@/lib/axios";

type findDmProps = { user: basicMember; conversationId?: string };
export async function findDmConvo({
  workspaceId,
  userId,
}: {
  workspaceId: string;
  userId: string;
}) {
  const res = await api.get<findDmProps>(
    `/api/workspace/${workspaceId}/conversation/dm/find`,
    {
      params: {
        userId,
      },
    },
  );
  return res.data;
}
