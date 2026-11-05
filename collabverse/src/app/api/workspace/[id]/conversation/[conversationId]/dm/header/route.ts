import { DmUserData } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom } from "@/lib/functions/error/apiError";
import { dmMembership } from "@/lib/serviceLayer/conversation/convoMembership";
import { fixMute } from "@/lib/serviceLayer/conversation/fixMute";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { User } from "@supabase/supabase-js";

export const GET = withAuth(
  async (
    user: User,
    req: Request,
    { params }: { params: { id: string; conversationId: string } },
  ) => {
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
      const membership = await dmMembership(
        workspaceId,
        conversationId,
        user.id,
      );
      if (!membership) {
        return apiErrorCustom("You are not authorised");
      }
      const res = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          type: "Dm",
        },
        select: {
          createdAt: true,
          conversationMember: {
            where: {
              userId: { not: user.id },
            },
            select: {
              mutedAt: true,
              mutedFor: true,

              workspaceMember: {
                select: {
                  lastSeenAt: true,
                  user: {
                    select: {
                      id: true,
                      name: true,
                      avatar: true,
                      username: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      const otherUser = res?.conversationMember.at(0)?.workspaceMember.user;
      if (!res || !otherUser) {
        return apiErrorCustom("Conversation not found");
      }
      const mutedFor = res.conversationMember.at(0)?.mutedFor;
      const mutedAt = res.conversationMember.at(0)?.mutedAt;
      const data: DmUserData = {
        id: otherUser.id,
        name: otherUser.name ?? "unknown",
        username: otherUser.username ?? "unknown",
        avatar: otherUser.avatar ?? undefined,
        createdAt: res.createdAt,
        mute: mutedFor ?? undefined,
        mutedAt: mutedAt ?? undefined,
        lastSeenAt:
          res.conversationMember.at(0)?.workspaceMember.lastSeenAt ?? undefined,
      };
      await fixMute(conversationId, user.id, mutedFor ?? null, mutedAt ?? null);
      return Response.json({ data });
    } catch (e) {
      console.error(e);
      return apiErrorCustom("Something went wrong");
    }
  },
);
