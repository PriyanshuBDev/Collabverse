import { projectRole } from "../project/projectRole";
import { wsRole } from "../workspace/wsRole";
import { taskRole } from "./taskRole";
import { TaskRole } from "@prisma/client";
type TaskAuthorityResult =
  | { success: false }
  | { success: true; authority: TaskRole | "High" };
export async function taskAuthority(
  userId: string,
  workspaceId: string,
  projectId: string,
  taskId: string,
): Promise<TaskAuthorityResult> {
  const userWsRole = await wsRole(userId, workspaceId);
  if (!userWsRole) {
    return { success: false };
  }
  if (userWsRole === "Owner" || userWsRole === "Admin") {
    return { success: true, authority: "High" };
  }

  const userProjectRole = await projectRole(userId, workspaceId, projectId);
  if (!userProjectRole) {
    return { success: false };
  }
  if (userProjectRole === "Owner" || userProjectRole === "Manager") {
    return { success: true, authority: "High" };
  }

  const userTaskRole = await taskRole(userId, taskId);
  if (userTaskRole) {
    return { success: true, authority: userTaskRole };
  }

  return { success: false };
}
