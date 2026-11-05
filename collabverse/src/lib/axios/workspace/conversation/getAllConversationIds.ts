import { allConversationResProps } from "@/app/interfaces";
import api from "../..";

export async function getAllConversationIds({
  workspaceId,
}: {
  workspaceId: string;
}) {
  const res = await api.get<{ data: allConversationResProps[] }>(
    `/api/workspace/${workspaceId}/conversation/ids`,
  );
  return res.data.data;
}
