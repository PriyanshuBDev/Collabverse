import { allRole, Tier } from "@/app/interfaces";
import { useIsAllowed } from "@/lib/hooks/useIsAllowed";
import { PPermission, PRole } from "@prisma/client";
import { useCurrentWorkspace } from "./useCurrentWorkspace";
type Params = {
  type: Tier;
  currentWsRole: allRole;
  currentProjectRole?: PRole;
  targetRole: allRole;
  isSelf: boolean;
  adminRemovePerm: boolean;
  projectPerms?: PPermission[];
};

export function canRemoveUser({
  type,
  currentWsRole,
  currentProjectRole,
  targetRole,
  isSelf,
  adminRemovePerm,
  projectPerms = [],
}: Params): boolean {
  if (isSelf) return false;

  // 🚫 Protect workspace owner at workspace level
  if (type === "Workspace" && targetRole === "Owner") {
    return false;
  }

  // 🔥 Workspace authority overrides everything
  if (currentWsRole === "Owner") {
    return true;
  }

  if (currentWsRole === "Admin" && adminRemovePerm) {
    return true;
  }

  // 🔹 Project / Task level authority
  if (type === "Project" || type === "Task") {
    // Project Owner
    if (currentProjectRole === "Owner") {
      return true;
    }

    // Project Manager
    if (
      currentProjectRole === "Manager" &&
      projectPerms.includes("Remove_Member") &&
      targetRole !== "Owner"
    ) {
      return true;
    }
  }

  return false;
}
export function useRemovePerm({
  pRole,
  projectPerms,
  userRole,
  isSelf,
  type,
}: {
  pRole?: PRole;
  projectPerms?: PPermission[];
  userRole: allRole;
  isSelf: boolean;
  type: Tier;
}) {
  const { role } = useCurrentWorkspace();
  const adminRemoveMemPerm = useIsAllowed("Remove_Member", "admin");
  return canRemoveUser({
    type,
    currentWsRole: role,
    currentProjectRole: pRole,
    targetRole: userRole,
    isSelf,
    adminRemovePerm: adminRemoveMemPerm,
    projectPerms,
  });
}
