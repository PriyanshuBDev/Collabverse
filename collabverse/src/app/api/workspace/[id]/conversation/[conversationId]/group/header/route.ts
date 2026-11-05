import { basicFormerMember, GroupData } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom } from "@/lib/functions/error/apiError";
import { fixMute } from "@/lib/serviceLayer/conversation/fixMute";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { User } from "@supabase/supabase-js";

export const GET = withAuth(
  async (
    user: User,
    req: Request,
    { params: paramsPromise }: { params: Promise<{ id: string; conversationId: string }> },
  ) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    const conversationId = params.conversationId;

    if (!workspaceId || !conversationId) {
      return apiErrorCustom("Invalid parameters");
    }
    try {
      const currentUserWsRole = await wsRole(user.id, workspaceId);
      if (!currentUserWsRole) {
        return apiErrorCustom("You are not authorised");
      }

      const membership = await prisma.conversationMember.findFirst({
        where: {
          userId: user.id,
          conversationId,
          workspaceId,
          status: "Active",
          kickedAt: null,
          leftAt: null,
          deletedAt: null,
        },
        select: {
          mutedAt: true,
          mutedFor: true,
          role: true,
        },
      });
      if (!membership) {
        return apiErrorCustom("You are not authorised");
      }

      const res = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          workspaceId,
          type: "Group",
        },
        select: {
          id: true,
          name: true,
          avatar: true,
          avatarPath: true,
          description: true,
          createdAt: true,
          createdById: true,
          groupPermissions: {
            select: {
              permissions: true,
            },
          },
          _count: {
            select: {
              conversationMember: true,
            },
          },
        },
      });
      if (!res) {
        return apiErrorCustom("Group not found");
      }
      let createdBy: basicFormerMember = {
        id: "",
        name: "Former Member",
        avatar: undefined,
      };
      if (res.createdById) {
        const creator = await prisma.workspaceMember.findUnique({
          where: {
            userId_workspaceId: {
              userId: res.createdById,
              workspaceId,
            },
          },
          select: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        });
        if (creator) {
          createdBy = {
            id: creator.user.id,
            name: creator.user.name ?? "unknown",
            avatar: creator.user.avatar ?? undefined,
          };
        }
      }
      const data: GroupData = {
        id: res.id,
        currentUserRole: membership.role ?? undefined,
        name: res.name ?? "unknown",
        avatar: res.avatar ?? undefined,
        avatarPath: res.avatarPath ?? undefined,
        description: res.description ?? undefined,
        totalMembers: res._count.conversationMember,
        mute: membership.mutedFor ?? undefined,
        mutedAt: membership.mutedAt ?? undefined,
        permissions: res.groupPermissions?.permissions ?? [],
        currentUserStatus: "Active",
        createdBy,
        createdAt: res.createdAt,
      };
      await fixMute(
        conversationId,
        user.id,
        membership.mutedFor,
        membership.mutedAt,
      );
      return Response.json({ data });
    } catch {
      return apiErrorCustom("Something went wrong");
    }
  },
);
