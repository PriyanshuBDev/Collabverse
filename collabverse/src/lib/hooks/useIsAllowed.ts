"use client";

import { WsPermission } from "@prisma/client";
import { useCurrentWorkspace } from "./useCurrentWorkspace";
import { WsMembersPerm } from "../queries/workspace/useWorkspace";

export function useIsAllowed(
  permission: WsPermission,
  role: "member" | "admin",
): boolean {
  const workspace = useCurrentWorkspace();

  if (!workspace) return false;

  if (role === "admin") {
    return workspace.permissions.admin.includes(permission);
  }

  // role === member
  return workspace.permissions.member.includes(permission as WsMembersPerm);
}
