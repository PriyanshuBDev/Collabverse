import api from "@/lib/axios";
import { AuthParamExistsNormal } from "@/lib/axios/errors/AuthParamExistsNormal";
import axios from "axios";

export async function removeTaskUser({
  userId,
  workspaceId,
  projectId,
  taskId,
}: {
  userId: string;
  workspaceId: string;
  projectId: string;
  taskId: string;
}) {
  try {
    await api.delete(
      `/api/workspace/${workspaceId}/projects/${projectId}/tasks/${taskId}/users/${userId}/remove`,
    );
  } catch (e) {
    if (axios.isAxiosError(e)) {
      const error = AuthParamExistsNormal(e);
      throw error;
    }
    throw new Error("Something went wrong");
  }
}
