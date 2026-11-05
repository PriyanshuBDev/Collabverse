import api from "../..";

export async function patchMusicLevel(level: number) {
  return await api.patch(`/api/user/appearance/musicLevel`, {
    level,
  });
}
