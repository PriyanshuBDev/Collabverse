import api from "@/lib/axios";
import { Doors } from "@prisma/client";

export async function toggleDoors({
  workspaceId,
  projectId,
  doorId,
  enabled,
}: {
  workspaceId: string;
  projectId: string;
  doorId: Doors;
  enabled: boolean;
}) {
  await api.patch(
    `/api/workspace/${workspaceId}/projects/${projectId}/flowSpace/toggle-doors`,
    {
      doorId,
      enabled,
    },
  );
}
