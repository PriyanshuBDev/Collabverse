"use client";

import { PPermission } from "@prisma/client";
import { useCurrentProject } from "./useCurrentProject";
import {
  projectContributorPerm,
  projectManagerPerm,
  projectViewerPerm,
} from "@/app/interfaces";

export function useIsAllowedProject(
  perm: PPermission,
  role: "Manager" | "Contributor" | "Viewer",
): boolean {
  const project = useCurrentProject();
  if (!project?.permissions) {
    return false;
  }
  if (role === "Manager") {
    return project.permissions.manager.includes(perm as projectManagerPerm);
  }

  if (role === "Contributor") {
    return project.permissions.contributor.includes(
      perm as projectContributorPerm,
    );
  }
  return project.permissions.viewer.includes(perm as projectViewerPerm);
}

export function useIsAllowedToInviteProject() {
  const project = useCurrentProject();
  const managerPerm = useIsAllowedProject("Invite", "Manager");
  const contributorPerm = useIsAllowedProject("Invite", "Contributor");
  if (!project) return false;
  if (
    project.role === "High" ||
    (project.role === "Contributor" && contributorPerm) ||
    (project.role === "Manager" && managerPerm) ||
    project.role === "Owner"
  ) {
    return true;
  }
  return false;
}

export function useIsAllowedToRemoveProject() {
  const project = useCurrentProject();
  const managerPerm = useIsAllowedProject("Remove_Member", "Manager");
  if (!project) return false;
  if (
    project.role === "High" ||
    (project.role === "Manager" && managerPerm) ||
    project.role === "Owner"
  ) {
    return true;
  }
  return false;
}

export function useIsAllowedToEditProject() {
  const project = useCurrentProject();
  const managerPerm = useIsAllowedProject("Edit_Project_Details", "Manager");
  if (!project) return false;
  if (
    project.role === "High" ||
    (project.role === "Manager" && managerPerm) ||
    project.role === "Owner"
  ) {
    return true;
  }
  return false;
}
export function useIsAllowedToCommentProject() {
  const project = useCurrentProject();
  const managerPerm = useIsAllowedProject("Comment", "Manager");
  const contributorPerm = useIsAllowedProject("Comment", "Contributor");
  const viewerPerm = useIsAllowedProject("Comment", "Viewer");
  if (!project) return false;
  if (
    project.role === "High" ||
    (project.role === "Contributor" && contributorPerm) ||
    (project.role === "Manager" && managerPerm) ||
    (project.role === "Viewer" && viewerPerm) ||
    project.role === "Owner"
  ) {
    return true;
  }
  return false;
}
