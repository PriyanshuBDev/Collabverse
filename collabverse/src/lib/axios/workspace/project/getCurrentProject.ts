import {
  projectAuthorityRole,
  projectContributorPerm,
  projectManagerPerm,
  projectViewerPerm,
} from "@/app/interfaces";
import api from "../..";
export type projectPermissionState = {
  manager: projectManagerPerm[];
  contributor: projectContributorPerm[];
  viewer: projectViewerPerm[];
};
export interface projectSlugProps {
  id: string;
  name: string;
  avatar?: string;
  slug: string;
  role: projectAuthorityRole;
  permissions: projectPermissionState;
  joinedAt?: Date;
}

export async function getCurrentProject({
  workspaceId,
  slug,
}: {
  workspaceId: string;
  slug: string;
}) {
  const res = await api.get<projectSlugProps>(
    `/api/workspace/${workspaceId}/projects/current/${slug}`,
  );
  return res.data;
}
