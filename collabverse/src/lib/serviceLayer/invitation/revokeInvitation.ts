import { prisma } from "@/lib/db/prisma";

export async function revokeInvitationEveryWhere(
  createdById: string,
  workspaceId: string,
) {
  return await prisma.invitation.updateMany({
    where: {
      createdById,
      workspaceId,
      status: "Pending",
    },
    data: {
      status: "Revoked",
    },
  });
}
export async function revokeInvitationOfProject(
  createdById: string,
  workspaceId: string,
  projectId: string,
) {
  return await prisma.invitation.updateMany({
    where: {
      createdById,
      workspaceId,
      projectId,
      status: "Pending",
    },
    data: {
      status: "Revoked",
    },
  });
}
export async function revokeInvitationOfWs(
  createdById: string,
  workspaceId: string,
) {
  return await prisma.invitation.updateMany({
    where: {
      createdById,
      workspaceId,
      projectId: null,
      status: "Pending",
    },
    data: {
      status: "Revoked",
    },
  });
}
