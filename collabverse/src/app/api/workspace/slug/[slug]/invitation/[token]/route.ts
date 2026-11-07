import { basicWsDetails, wsInvitationProps } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom } from "@/lib/functions/error/apiError";
import { hashToken } from "@/lib/functions/invitation/hashToken";
import { User } from "@supabase/supabase-js";

export const GET = withAuth(
  async (
    user: User,
    req: Request,
    {
      params: paramsPromise,
    }: { params: Promise<{ slug: string; token: string }> },
  ) => {
    const params = await paramsPromise;
    const workspaceSlug = params.slug;
    const token = params.token;
    if (!workspaceSlug || !token) {
      return apiErrorCustom("Invalid parameters");
    }
    try {
      const ws = await prisma.workspace.findUnique({
        where: {
          slug: workspaceSlug,
        },
        select: {
          id: true,
          name: true,
          avatar: true,
          description: true,
          currentOwner: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              members: true,
            },
          },
        },
      });
      if (!ws) {
        return apiErrorCustom("Workspace not found");
      }
      const tokenHash = await hashToken(token);
      const invite = await prisma.invitation.findFirst({
        where: {
          tokenHash,
          workspaceId: ws.id,
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
          joinRequests: {
            where: {
              userId: user.id,
            },
            take: 1,
            select: {
              status: true,
            },
          },
        },
      });
      if (!invite) {
        return apiErrorCustom("Invitation not found");
      }

      const workspace: basicWsDetails = {
        ...ws,
        avatar: ws.avatar ?? undefined,
        description: ws.description ?? undefined,
        members: ws._count.members,
        owner: {
          id: ws.currentOwner.id,
          name: ws.currentOwner.name ?? "unknown",
          avatar: ws.currentOwner.avatar ?? undefined,
        },
      };
      const invitation: wsInvitationProps = {
        ...invite,
        expireAt: invite.expireAt ?? undefined,
        available: invite.maxUses ? invite.maxUses - invite.usedCount : null,
        workspace,
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
        joinRequestStatus: invite.joinRequests.at(0)?.status ?? undefined,
      };

      return Response.json({ invitation }, { status: 200 });
    } catch {
      return apiErrorCustom("Something went wrong");
    }
  },
);
