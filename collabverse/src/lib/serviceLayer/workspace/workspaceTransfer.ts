import { prisma } from "@/lib/db/prisma";
import { hasPermInWorkspace } from "./hasPermInWorkspace";
import { prismaTransactionProp } from "@/app/interfaces";

export async function workspaceTransfer(
  workspaceId: string,
  fromUserId: string,
  toUserId: string,
) {
  const canAdminInvite = await hasPermInWorkspace(
    "Admin",
    "Invite",
    workspaceId,
  );
  return prisma.$transaction(async (tx: prismaTransactionProp) => {
    const currentOwner = await tx.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: fromUserId,
          workspaceId,
        },
      },
    });
    if (currentOwner?.role !== "Owner") {
      throw new Error("Only owner can transfer ownership");
    }

    await tx.workspaceMember.update({
      where: {
        userId_workspaceId: {
          userId: fromUserId,
          workspaceId,
        },
      },
      data: {
        role: "Admin",
      },
    });

    await tx.workspaceMember.update({
      where: {
        userId_workspaceId: {
          userId: toUserId,
          workspaceId,
        },
      },
      data: {
        role: "Owner",
      },
    });

    await tx.workspace.update({
      where: {
        id: workspaceId,
      },
      data: {
        currentOwnerId: toUserId,
      },
    });
    if (!canAdminInvite) {
      await tx.invitation.updateMany({
        where: {
          workspaceId,
          projectId: null,
          createdById: fromUserId,
          status: "Pending",
        },
        data: {
          status: "Revoked",
        },
      });
    }
  });
}
