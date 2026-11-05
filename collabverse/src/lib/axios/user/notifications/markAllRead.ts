import api from "../..";

export async function markAllRead() {
  return await api.patch(`/api/user/notifications/mark-all-read`);
}
