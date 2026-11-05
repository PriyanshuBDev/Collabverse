import { userIdProp } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiError } from "@/lib/functions/error/apiError";
import { workspaceTransfer_notification } from "@/lib/functions/notifications/notifications";
import { workspaceTransfer } from "@/lib/serviceLayer/workspace/workspaceTransfer";
import { User } from "@supabase/supabase-js";
import z, { ZodError } from "zod";
export const newOwnerSchema = z.object({
  newOwnerId: z.string().uuid({ message: "Invalid id" }),
});
export const PATCH = withAuth(
  async (user: User, req: Request, { params }: { params: { id: string } }) => {
    const workspaceId = params.id;
    if (!workspaceId) {
      return apiError("Invalid parameters", 400);
    }

    const data = await req.json();
    try {
      const { newOwnerId } = newOwnerSchema.parse(data);
      if (user.id === newOwnerId) {
        return apiError("You cannot transfer ownership to yourself", 400);
      }
      const currentUser = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: user.id,
            workspaceId,
          },
        },
        select: {
          role: true,
          user: {
            select: {
              name: true,
            },
          },
          workspace: {
            select: {
              name: true,
            },
          },
        },
      });
      if (!currentUser) {
        return apiError("You are not authorised", 403);
      }

      if (currentUser.role !== "Owner") {
        return apiError("Only owner can transfer ownership", 400);
      }
      const userExists = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: newOwnerId,
            workspaceId,
          },
        },
        select: {
          role: true,
          user: {
            select: {
              name: true,
            },
          },
        },
      });
      if (!userExists) {
        return apiError("User either doesn't exist or not a member", 404);
      }
      await workspaceTransfer(workspaceId, user.id, newOwnerId);
      try {
        await prisma.activity.create({
          data: {
            workspaceId,
            projectId: null,
            taskId: null,
            type: "workspace_ownership_changed",
            actorUserId: user.id,
            affectedUserId: newOwnerId,
          },
        });
      } catch (e) {
        console.log("Activity logging failed", e);
      }
      try {
        const allMembers = (
          await prisma.workspaceMember.findMany({
            where: {
              workspaceId,
              userId: {
                notIn: [user.id, newOwnerId],
              },
            },
            select: {
              userId: true,
            },
          })
        )
          .map((a: userIdProp) => a.userId)
          .filter((i: string) => i !== user.id && i !== newOwnerId);

        await workspaceTransfer_notification(
          allMembers,
          workspaceId,
          user.id,
          currentUser.user.name ?? "unknown",
          newOwnerId,
          userExists.user.name ?? "unknown",
        );
      } catch (e) {
        console.log("Notification logging failed", e);
      }

      return Response.json({ success: true }, { status: 200 });
    } catch (e) {
      if (e instanceof ZodError) {
        return Response.json(
          { errors: e.flatten().fieldErrors },
          { status: 400 },
        );
      }
      return apiError("Something went wrong", 500);
    }
  },
);
