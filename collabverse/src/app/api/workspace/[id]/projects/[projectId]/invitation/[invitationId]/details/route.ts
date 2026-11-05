import { basicProjectDetails, projectInvitationProps } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom } from "@/lib/functions/error/apiError";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { User } from "@supabase/supabase-js";

export const GET = withAuth(
  async (
    user: User,
    req: Request,
    {
      params: paramsPromise,
    }: { params: Promise<{ id: string; projectId: string; invitationId: string }> },
  ) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    const projectId = params.projectId;
    const invitationId = params.invitationId;
    if (!workspaceId || !projectId || !invitationId) {
      return apiErrorCustom("Invalid parameters");
    }
    try {
      const userWsRole = await wsRole(user.id, workspaceId);
      if (!userWsRole) {
        return apiErrorCustom("You are not authorised");
      }
      const invite = await prisma.invitation.findFirst({
        where: {
          id: invitationId,
          workspaceId,
        },
        select: {
          status: true,
          id: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          role: true,
          maxUses: true,
          usedCount: true,
          expireAt: true,
          createdAt: true,
        },
      });
      if (!invite) {
        return apiErrorCustom("Invitation not found");
      }
      const res = await prisma.project.findUnique({
        where: {
          id: projectId,
        },
        select: {
          id: true,
          name: true,
          avatar: true,
          description: true,
          slug: true,
          currentOwner: {
            select: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                },
              },
            },
          },
          _count: {
            select: {
              members: true,
            },
          },
        },
      });
      if (!res) {
        return apiErrorCustom("Project not found");
      }
      const project: basicProjectDetails = {
        ...res,
        avatar: res.avatar ?? undefined,
        description: res.description ?? undefined,
        members: res._count.members,
        owner: {
          id: res.currentOwner.user.id,
          name: res.currentOwner.user.name ?? "unknown",
          avatar: res.currentOwner.user.avatar ?? undefined,
        },
      };
      const invitation: projectInvitationProps = {
        ...invite,
        expireAt: invite.expireAt ?? undefined,
        project,
        invitedBy: invite.createdBy
          ? {
              id: invite.createdBy.id,
              name: invite.createdBy.name ?? "unknown",
              avatar: invite.createdBy.avatar ?? undefined,
            }
          : {
              id: undefined,
              name: "Former member",
              avatar: "/assets/anonymous.webp",
            },
      };
      return Response.json({ invitation }, { status: 200 });
    } catch {
      return apiErrorCustom("Something went wrong");
    }
  },
);
