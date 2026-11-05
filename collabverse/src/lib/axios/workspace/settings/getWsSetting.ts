import { WorkspaceSettingsProps } from "@/app/interfaces";
import api from "../..";

export async function getWsSetting(id: string) {
  const res = await api.get<{ workspace: WorkspaceSettingsProps }>(
    `/api/workspace/${id}/settings`,
  );
  return res.data.workspace;
}
