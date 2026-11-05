import api from "@/lib/axios";

export async function getTotalMembersCount({
  workspaceId,
  conversationId,
}: {
  workspaceId: string;
  conversationId: string;
}) {
  const res = await api.get<{ length: number }>(
    `/api/workspace/${workspaceId}/conversation/${conversationId}/group/users/length`,
  );
  return res.data.length;
}
