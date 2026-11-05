import { CharacterAppearance } from "@/app/interfaces";
import api from "../..";

export async function changeUserAppearance(appearance: CharacterAppearance) {
  return await api.patch(`/api/user/appearance/patch`, {
    ...appearance,
  });
}
