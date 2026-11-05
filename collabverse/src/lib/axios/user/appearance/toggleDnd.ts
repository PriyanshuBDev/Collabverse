import api from "../..";

export async function toggleDnd() {
  const res = await api.patch<{ dnd: boolean }>(
    `/api/user/appearance/toggle-dnd`,
  );
  return res.data.dnd;
}
