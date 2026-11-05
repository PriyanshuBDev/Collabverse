import { memberProps } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom, zodApiError } from "@/lib/functions/error/apiError";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { User } from "@supabase/supabase-js";
import z from "zod";
type userProp = {
  user: {
    id: string;
    name: string | null;
    avatar: string | null;
    username: string | null;
  };
};
const usersToAddGroupSchema = z.object({
  search: z.string().trim().min(2).optional(),
  cursor: z.uuid().optional(),
  groupId: z.uuid().optional(),
});

export const GET = withAuth(
  async (user: User, req: Request, { params }: { params: { id: string } }) => {
    const workspaceId = params.id;
    const { searchParams } = new URL(req.url);
    if (!workspaceId) {
      return apiErrorCustom("Invalid parameters");
    }
    const queryObj = Object.fromEntries(searchParams.entries());
    const limit = 20;
    try {
      const { search, cursor, groupId } = usersToAddGroupSchema.parse(queryObj);
      const userWsRole = await wsRole(user.id, workspaceId);
      if (!userWsRole) {
        return apiErrorCustom("You are not authorised");
      }
      const groupMemberIds: string[] = [];
      if (groupId) {
        const groupMembers = await prisma.conversationMember.findMany({
          where: {
            conversationId: groupId,
            kickedAt: null,
            workspaceId,
          },
          select: {
            userId: true,
          },
        });
        groupMembers.forEach((m) => groupMemberIds.push(m.userId));
      }
      const rows = await prisma.workspaceMember.findMany({
        where: {
          workspaceId,
          userId: {
            notIn: groupMemberIds,
            not: user.id,
          },
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
              username: true,
              avatar: true,
            },
          },
        },
      });
      const hasMore = rows.length > limit;
      const requiredRows = hasMore ? rows.slice(0, limit) : rows;
      const users: memberProps[] = requiredRows.map((w: userProp) => ({
        id: w.user.id,
        name: w.user.name ?? "unknown",
        username: w.user.username ?? "",
        avatar: w.user.avatar ?? undefined,
      }));
      const last = users.length > 0 ? users[users.length - 1] : null;
      return Response.json({
        users,
        nextCursor: hasMore && last ? last.id : null,
        hasMore,
      });
    } catch (e) {
      return zodApiError(e);
    }
  },
);
