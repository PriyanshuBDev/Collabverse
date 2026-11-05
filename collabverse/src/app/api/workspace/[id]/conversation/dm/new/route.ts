import { withAuth } from "@/lib/api/auth/withAuth";
import { apiErrorCustom, zodApiError } from "@/lib/functions/error/apiError";
import { User } from "@supabase/supabase-js";
import { cursorSearchSchema } from "../../../projects/[projectId]/tasks/[taskId]/users/assign/users/route";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { prisma } from "@/lib/db/prisma";
import { memberProps } from "@/app/interfaces";
type convoMemberProp = {
  conversationMember: {
    userId: string;
  }[];
};
type rowProp = {
  user: {
    id: string;
    name: string | null;
    avatar: string | null;
    username: string | null;
  };
};
export const GET = withAuth(
  async (user: User, req: Request, { params }: { params: { id: string } }) => {
    const workspaceId = params.id;
    const { searchParams } = new URL(req.url);
    const queryObj = Object.fromEntries(searchParams.entries());
    if (!workspaceId) {
      return apiErrorCustom("Invalid parameters");
    }
    const limit = 20;
    try {
      const { search, cursor } = cursorSearchSchema.parse(queryObj);
      const userWsRole = await wsRole(user.id, workspaceId);
      if (!userWsRole) {
        return apiErrorCustom("You are not authorised");
      }
      const conversationIds = (
        await prisma.conversation.findMany({
          where: {
            type: "Dm",
            workspaceId,
            conversationMember: {
              some: {
                userId: user.id,
                leftAt: null,
                deletedAt: null,
              },
            },
          },
          select: {
            conversationMember: {
              where: {
                userId: {
                  not: user.id,
                },
              },
              select: {
                userId: true,
              },
            },
          },
        })
      )
        .map((c: convoMemberProp) => c.conversationMember[0]?.userId)
        .filter(Boolean);
      const rows = await prisma.workspaceMember.findMany({
        where: {
          userId: {
            notIn: conversationIds,
          },
          workspaceId,
          ...(search !== undefined &&
            search.length > 1 && {
              user: {
                OR: [
                  { name: { contains: search, mode: "insensitive" } },
                  { username: { contains: search, mode: "insensitive" } },
                ],
              },
            }),
        },
        take: limit + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor
          ? {
              userId_workspaceId: {
                userId: cursor,
                workspaceId,
              },
            }
          : undefined,
        orderBy: [{ userId: "asc" }, { joinedAt: "asc" }],
        select: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
              username: true,
            },
          },
        },
      });
      const hasMore = rows.length > limit;
      const requiredRows = hasMore ? rows.slice(0, limit) : rows;
      const users: memberProps[] = requiredRows.map((r: rowProp) => {
        const u = r.user;
        return {
          id: u.id,
          name: u.name ?? "unknown",
          avatar: u.avatar ?? undefined,
          username: u.username ?? "",
        };
      });
      const last = users.length > 0 ? users[users.length - 1] : null;
      return Response.json(
        { users, nextCursor: hasMore && last ? last.id : null, hasMore },
        { status: 200 },
      );
    } catch (e) {
      return zodApiError(e);
    }
  },
);
