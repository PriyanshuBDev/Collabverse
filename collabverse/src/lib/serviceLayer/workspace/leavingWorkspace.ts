import { prisma } from "@/lib/db/prisma";
import { workspace_left_notification } from "@/lib/functions/notifications/notifications";
import { ActivityType } from "@prisma/client";

export async function leavingWorkspace(userId: string, workspaceId: string) {
  try {
    const isMember = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
      select: {
        userId: true,
        workspace: {
          select: {
            name: true,
          },
        },
      },
    });
    if (!isMember) {
      throw new Error("Not a member");
    }
    try {
      await prisma.activity.create({
        data: {
          workspaceId,
          projectId: null,
          taskId: null,
          type: ActivityType.workspace_member_left,
        },
      });
    } catch (e) {
      console.log("Activity logging failed", e);
    }
    await prisma.workspaceMember.delete({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
    });

    await workspace_left_notification(
      userId,
      workspaceId,
      isMember.workspace.name,
    );
  } catch (e) {
    throw e;
  }
}
