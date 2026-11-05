import { PPermission } from "@prisma/client";
import { projectRoleChange } from "../users/roleChangeProjectUser";
import api from "@/lib/axios";

export async function toggleProjectPerm({
  workspaceId,
  permission,
  projectId,
  role,
  enabled,
}: {
  workspaceId: string;
  projectId: string;
  permission: PPermission;
  role: projectRoleChange;
  enabled: boolean;
}) {
  return await api.patch(
    `/api/workspace/${workspaceId}/projects/${projectId}/settings/permissions/${role}`,
    {
      permission,
      enabled,
    },
  );
}
