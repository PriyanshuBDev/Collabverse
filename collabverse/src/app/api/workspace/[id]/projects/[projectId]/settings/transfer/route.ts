import { withAuth } from "@/lib/api/auth/withAuth";
import { apiError } from "@/lib/functions/error/apiError";
import { User } from "@supabase/supabase-js";
import { ZodError } from "zod";
import { newOwnerSchema } from "../../../../settings/transfer/route";
import { prisma } from "@/lib/db/prisma";
import { hasPermInProject } from "@/lib/serviceLayer/project/hasPermInProject";
import { projectTransfer_notification } from "@/lib/functions/notifications/notifications";
import { prismaTransactionProp, wsMemberUserIdProp } from "@/app/interfaces";

export const PATCH = withAuth(
  async (
    user: User,
    req: Request,
    { params }: { params: { id: string; projectId: string } },
  ) => {
    const workspaceId = params.id;
    const projectId = params.projectId;
    if (!workspaceId || !projectId) {
      return apiError("Invalid parameters", 400);
    }
    const data = await req.json();
    try {
      const { newOwnerId } = newOwnerSchema.parse(data);
      const userWsMember = await prisma.workspaceMember.findUnique({
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
      if (!userWsMember) {
        return apiError("You are not authorised", 403);
      }
      const userWsRole = userWsMember.role;
      const userProjectMember = await prisma.projectMember.findUnique({
        where: {
          workspaceMemberUserId_workspaceMemberWsId_projectId: {
            workspaceMemberUserId: user.id,
            workspaceMemberWsId: workspaceId,
            projectId,
          },
        },
        select: {
          role: true,
          workspaceMember: {
            select: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });
      if (userWsRole !== "Owner" && userWsRole !== "Admin") {
        if (!userProjectMember || userProjectMember.role !== "Owner") {
          return apiError("You are not authorised", 403);
        }
      }
      const targetMember = await prisma.projectMember.findUnique({
        where: {
          workspaceMemberUserId_workspaceMemberWsId_projectId: {
            workspaceMemberUserId: newOwnerId,
            workspaceMemberWsId: workspaceId,
            projectId,
          },
        },
        select: {
          role: true,
          workspaceMember: {
            select: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
          project: {
            select: {
              name: true,
              slug: true,
              currentOwner: {
                select: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!targetMember) {
        return apiError("User must be a project member to become owner", 404);
      }
      const currentOwnerId = targetMember.project.currentOwner.user.id;
      if (currentOwnerId === newOwnerId) {
        return apiError("Already the owner", 400);
      }
      const canManagerInvite = await hasPermInProject(
        "Manager",
        "Invite",
        projectId,
      );
      await prisma.$transaction(async (tx: prismaTransactionProp) => {
        const project = await tx.project.findUnique({
          where: {
            id: projectId,
          },
          select: {
            currentOwnerId: true,
            workspaceId: true,
          },
        });
        if (
          !project ||
          (userWsRole !== "Owner" &&
            userWsRole !== "Admin" &&
            project.currentOwnerId !== user.id)
        ) {
          throw new Error("You are not authorised");
        }
        if (project.workspaceId !== workspaceId) {
          throw new Error("Project not found");
        }
        await tx.project.update({
          where: {
            id: projectId,
            workspaceId,
          },
          data: {
            currentOwnerId: newOwnerId,
          },
        });
        await tx.projectMember.updateMany({
          where: {
            workspaceMemberUserId: newOwnerId,
            workspaceMemberWsId: workspaceId,
            projectId,
          },
          data: {
            role: "Owner",
          },
        });
        await tx.projectMember.updateMany({
          where: {
            workspaceMemberUserId: currentOwnerId,
            workspaceMemberWsId: workspaceId,
            projectId,
          },
          data: {
            role: "Manager",
          },
        });
        if (!canManagerInvite) {
          await tx.invitation.updateMany({
            where: {
              createdById: currentOwnerId,
              workspaceId,
              projectId,
              status: "Pending",
            },
            data: {
              status: "Revoked",
            },
          });
        }
      });
      try {
        await prisma.activity.create({
          data: {
            workspaceId,
            projectId,
            type: "project_ownership_changed",
            actorUserId: user.id,
            affectedUserId: newOwnerId,
          },
        });
      } catch (e) {
        console.error("Activity logging failed", e);
      }
      try {
        const actorName = userWsMember.user.name;
        const currentOwnerName =
          targetMember.project.currentOwner.user.name ?? "unknown";
        const newOwnerName =
          targetMember.workspaceMember.user.name ?? "unknown";
        const transferredBy =
          currentOwnerId === user.id ? undefined : (actorName ?? "unknown");
        const allMembers = (
          await prisma.projectMember.findMany({
            where: {
              projectId,
              workspaceMemberWsId: workspaceId,
              workspaceMemberUserId: {
                notIn: [user.id, newOwnerId, currentOwnerId],
              },
            },
            select: {
              workspaceMemberUserId: true,
            },
          })
        ).map((a: wsMemberUserIdProp) => a.workspaceMemberUserId);
        await projectTransfer_notification(
          allMembers,
          workspaceId,
          targetMember.project.currentOwner.user.id,
          user.id,
          newOwnerId,
          targetMember.project.name,
          targetMember.project.slug,
          newOwnerName,
          currentOwnerName,
          transferredBy,
        );
      } catch (e) {
        console.error("Notification logging failed", e);
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
