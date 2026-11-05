import { taskRoleSchema } from "@/app/api/workspace/[id]/projects/[projectId]/tasks/[taskId]/users/[userId]/role-change/route";
import api from "@/lib/axios";
import { AuthParamExistsNormal } from "@/lib/axios/errors/AuthParamExistsNormal";
import axios from "axios";
import z from "zod";

export type taskRoleChange = z.infer<typeof taskRoleSchema>["role"];

export async function roleChangeTaskUser({
  role,
  userId,
  workspaceId,
  projectId,
  taskId,
}: {
  role: taskRoleChange;
  userId: string;
  workspaceId: string;
  projectId: string;
  taskId: string;
}) {
  try {
    await api.patch(
      `/api/workspace/${workspaceId}/projects/${projectId}/tasks/${taskId}/users/${userId}/role-change`,
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
