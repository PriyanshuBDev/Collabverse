import api from "../..";

export async function leaveWs(id: string) {
  return await api.delete(`/api/workspace/${id}/settings/leave`);
}
