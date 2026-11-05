import api from "@/lib/axios";
import { AuthParamExistsNormal } from "@/lib/axios/errors/AuthParamExistsNormal";
import axios from "axios";
import z from "zod";
import { roleChangeTaskUser } from "../tasks/users/roleChangeTaskUser";
import { TaskRole } from "@prisma/client";
export const projectRoleSchema = z.object({
  role: z.enum(["Manager", "Contributor", "Viewer"]),
});
export type projectRoleChange = z.infer<typeof projectRoleSchema>["role"];

export async function roleChangeProjectUser({
  role,
  userId,
  workspaceId,
  projectId,
}: {
  role: projectRoleChange;
  userId: string;
  workspaceId: string;
  projectId: string;
}) {
  try {
    await api.patch(
      `/api/workspace/${workspaceId}/projects/${projectId}/users/${userId}/role-change`,
      {
        role,
      },
    );
  } catch (e) {
    if (axios.isAxiosError(e)) {
      const error = AuthParamExistsNormal(e);
      throw error;
    }
    throw new Error("Something went wrong");
  }
}
export type projectTaskRole = projectRoleChange | TaskRole;
export async function projectTaskRoleChange({
  role,
  userId,
  workspaceId,
  projectId,
  taskId,
}: {
  role: projectTaskRole;
  userId: string;
  workspaceId: string;
  projectId: string;
  taskId?: string;
}) {
  if (taskId) {
    return roleChangeTaskUser({
      role: role as TaskRole,
      userId,
      workspaceId,
      projectId,
      taskId,
    });
  } else {
    return roleChangeProjectUser({
      role: role as projectRoleChange,
      userId,
      workspaceId,
      projectId,
    });
  }
}
