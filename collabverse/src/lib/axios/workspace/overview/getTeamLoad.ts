import { TLCDataProps } from "@/components/charts/TeamLoadChart";
import api from "../..";

export async function getTeamLoad({
  workspaceId,
  projectId,
}: {
  workspaceId: string;
  projectId: string;
}) {
  const res = await api.get<{ users: TLCDataProps[] }>(
    `/api/workspace/${workspaceId}/overview/team-load`,
    {
      params: {
        projectId,
      },
    },
  );
  return res.data.users;
}
