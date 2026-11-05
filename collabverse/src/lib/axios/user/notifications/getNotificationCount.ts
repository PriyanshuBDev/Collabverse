import api from "../..";

export async function getNotificationCount(workspaceId?: string) {
  const res = await api.get<{ count: number }>(
    `/api/user/notifications/count`,
    {
      params: {
        workspaceId,
      },
    },
  );
  return res.data.count;
}
