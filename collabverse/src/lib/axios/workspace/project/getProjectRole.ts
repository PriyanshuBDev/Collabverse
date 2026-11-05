import api from "@/lib/axios";
import { PRole } from "@prisma/client";

export async function getProjectRole({
  workspaceId,
  projectId,
}: {
  workspaceId: string;
  projectId: string;
}) {
  const res = await api.get<{ role: PRole | undefined }>(
    `/api/workspace/${workspaceId}/projects/${projectId}/role`,
  );
  return res.data;
}
