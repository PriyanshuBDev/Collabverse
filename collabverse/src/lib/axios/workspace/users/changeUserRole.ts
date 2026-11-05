import { wsRoleSchema } from "@/app/api/workspace/[id]/users/[userId]/role-change/route";
import z from "zod";
import { AuthParamExistsNormal } from "../../errors/AuthParamExistsNormal";
import api from "@/lib/axios";
import axios from "axios";
import {
  roleChangeTaskUser,
  taskRoleChange,
} from "../project/tasks/users/roleChangeTaskUser";
import {
  projectRoleChange,
  roleChangeProjectUser,
} from "../project/users/roleChangeProjectUser";

export type wsRoleChange = z.infer<typeof wsRoleSchema>["role"];
export async function changeUserRole({
  role,
  userId,
  workspaceId,
}: {
  role: wsRoleChange;
  userId: string;
  workspaceId?: string;
}) {
  try {
    await api.patch(
      `/api/workspace/${workspaceId}/users/${userId}/role-change`,
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

export type combinedRoleChange =
  | taskRoleChange
  | wsRoleChange
  | projectRoleChange;
export async function changeUserRoleCombined({
  role,
  workspaceId,
  projectId,
  taskId,
  userId,
}: {
  role: combinedRoleChange;
  userId: string;
  workspaceId: string;
  projectId?: string;
  taskId?: string;
}) {
  if (workspaceId && projectId && taskId) {
    return roleChangeTaskUser({
      role: role as taskRoleChange,
      workspaceId,
      projectId,
      taskId,
      userId,
    });
  } else if (workspaceId && projectId) {
    return roleChangeProjectUser({
      role: role as projectRoleChange,
      workspaceId,
      projectId,
      userId,
    });
  } else {
    return changeUserRole({ role: role as wsRoleChange, workspaceId, userId });
  }
}
