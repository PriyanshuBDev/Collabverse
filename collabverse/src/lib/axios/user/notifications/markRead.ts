import api from "../..";

export async function markRead(notificationId: string) {
  return await api.patch(`/api/user/notifications/${notificationId}/mark-read`);
}
