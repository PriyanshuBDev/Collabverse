import { taskAuthority } from "@/app/interfaces";
import { PRole, TaskRole, WsRole } from "@prisma/client";

export function taskLevelAuthority(
  wsRole: WsRole,
  projectRole?: PRole,
  taskRole?: TaskRole,
): taskAuthority | undefined {
  if (wsRole === "Owner" || wsRole === "Admin") {
    return "High";
  } else {
    if (projectRole === "Owner" || projectRole === "Manager") {
      return "High";
    } else {
      return taskRole;
    }
  }
}
