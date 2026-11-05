import api from "@/lib/axios";
import { Doors } from "@prisma/client";

export async function getOpenDoors({
  workspaceId,
  projectId,
}: {
  workspaceId: string;
  projectId: string;
}) {
  const res = await api.get<{ openDoors: Doors[] }>(
    `/api/workspace/${workspaceId}/projects/${projectId}/flowSpace/opendoors`,
  );
  return res.data.openDoors;
}
