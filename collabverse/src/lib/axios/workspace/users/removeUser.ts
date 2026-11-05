import api from "@/lib/axios";

import { AuthParamExistsNormal } from "../../errors/AuthParamExistsNormal";
import axios from "axios";
import { removeTaskUser } from "../project/tasks/users/removeTaskUser";
import { removeProjectUser } from "../project/users/removeProjectUser";

export async function removeUser({
  userId,
  workspaceId,
}: {
  userId: string;
  workspaceId: string;
}) {
  try {
    await api.delete(`/api/workspace/${workspaceId}/users/${userId}/remove`);
  } catch (e) {
    if (axios.isAxiosError(e)) {
      const error = AuthParamExistsNormal(e);
      throw error;
    }
    throw new Error("Something went wrong");
  }
}

export async function removeUserCombined({
  userId,
  workspaceId,
  projectId,
  taskId,
}: {
  userId: string;
  workspaceId: string;
  projectId?: string;
  taskId?: string;
}) {
  if (workspaceId && projectId && taskId) {
    return removeTaskUser({ userId, workspaceId, projectId, taskId });
  } else if (workspaceId && projectId) {
    return removeProjectUser({ userId, workspaceId, projectId });
  } else {
    return removeUser({ userId, workspaceId });
  }
}
