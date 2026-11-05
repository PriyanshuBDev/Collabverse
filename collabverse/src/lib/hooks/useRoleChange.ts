import { allRole, Tier } from "@/app/interfaces";
import { PRole } from "@prisma/client";
import { useCurrentWorkspace } from "./useCurrentWorkspace";
type Params = {
  type: Tier;
  currentWsRole: allRole;
  currentProjectRole?: PRole;
  targetRole: allRole;
  isSelf: boolean;
};

export function canChangeRole({
  type,
  currentWsRole,
  currentProjectRole,
  targetRole,
  isSelf,
}: Params): boolean {
  if (isSelf) return false;

  if (type === "Workspace" && targetRole === "Owner") {
    return false;
  }

  if (currentWsRole === "Owner" || currentWsRole === "Admin") {
    return true;
  }
  if (type === "Project" || type === "Task") {
    if (currentProjectRole === "Owner") {
      return true;
    }
    if (currentProjectRole === "Manager" && targetRole !== "Owner") {
      return true;
    }
  }

  return false;
}
export function useRoleChange({
  pRole,
  userRole,
  isSelf,
  type,
}: {
  pRole?: PRole;
  userRole: allRole;
  isSelf: boolean;
  type: Tier;
}) {
  const { role } = useCurrentWorkspace();
  return canChangeRole({
    type,
    currentWsRole: role,
    currentProjectRole: pRole,
    targetRole: userRole,
    isSelf,
  });
}
