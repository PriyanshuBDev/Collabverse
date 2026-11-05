import api from "..";

export async function getActivities({ id }: { id: string }) {
  try {
    const res = await api.get(`/api/workspace/${id}/activities`);
  } catch {}
}
