import { fullUserAppearance } from "@/app/interfaces";
import api from "../..";

export async function getUserAppearance() {
  const res = await api.get<{ userAppearance: fullUserAppearance }>(
    `/api/user/appearance`,
  );
  return res.data.userAppearance;
}
