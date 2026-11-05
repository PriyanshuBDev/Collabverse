import api from "@/lib/axios";
import { AuthParamExistsNormal } from "@/lib/axios/errors/AuthParamExistsNormal";
import axios from "axios";
import { removeTaskUser } from "../tasks/users/removeTaskUser";

export async function removeProjectUser({
  userId,
  workspaceId,
  projectId,
}: {
  userId: string;
  workspaceId: string;
  projectId: string;
}) {
  try {
    await api.delete(
      `/api/workspace/${workspaceId}/projects/${projectId}/users/${userId}/remove`,
    );
  } catch (e) {
    if (axios.isAxiosError(e)) {
      const error = AuthParamExistsNormal(e);
      throw error;
    }
    throw new Error("Something went wrong");
  }
}

export async function projectTaskRemoveUser({
  userId,
  workspaceId,
  projectId,
  taskId,
}: {
  userId: string;
  workspaceId: string;
  projectId: string;
  taskId?: string;
}) {
  if (taskId) {
    return removeTaskUser({ userId, workspaceId, projectId, taskId });
  } else {
    return removeProjectUser({ userId, workspaceId, projectId });
  }
}
