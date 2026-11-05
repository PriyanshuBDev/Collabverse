import { groupUsersProps } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom, zodApiError } from "@/lib/functions/error/apiError";
import { groupRole } from "@/lib/serviceLayer/conversation/groupRole";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { $Enums } from "@prisma/client";
import { User } from "@supabase/supabase-js";
import z from "zod";
type rowProps = {
  role: $Enums.GroupRole | null;
  workspaceMember: {
    user: {
      name: string | null;
      id: string;
      avatar: string | null;
      username: string | null;
    };
  };
};
export const getGroupUsersSchema = z.object({
  cursorId: z.uuid().optional(),
  search: z.string().min(2).optional(),
});
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
    const { searchParams } = new URL(req.url);
    const queryObj = Object.fromEntries(searchParams.entries());
    const PAGE_SIZE = 20;
    try {
      const { cursorId, search } = getGroupUsersSchema.parse(queryObj);
      const userWsRole = await wsRole(user.id, workspaceId);
      if (!userWsRole) {
        return apiErrorCustom("You are not authorised");
      }
      const userGroupRole = await groupRole(
        workspaceId,
        conversationId,
        user.id,
      );
      if (!userGroupRole) {
        return apiErrorCustom("You are not authorised");
      }
      const rows = await prisma.conversationMember.findMany({
        where: {
          conversationId,
          workspaceId,
          userId: { not: user.id },
          ...(search !== undefined && {
            workspaceMember: {
              user: {
                OR: [
                  { name: { contains: search, mode: "insensitive" } },
                  { username: { contains: search, mode: "insensitive" } },
                ],
              },
            },
          }),
        },
        take: PAGE_SIZE + 1,
        skip: cursorId ? 1 : 0,
        cursor: cursorId
          ? {
              userId_conversationId: {
                userId: cursorId,
                conversationId,
              },
            }
          : undefined,
        orderBy: [
          {
            userId: "asc",
          },
          { role: "asc" },
        ],
        select: {
          role: true,
          workspaceMember: {
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
          },
        },
      });
      const hasMore = rows.length > PAGE_SIZE;
      const requiredRows = hasMore ? rows.slice(0, PAGE_SIZE) : rows;
      const users: groupUsersProps[] = requiredRows.map((r: rowProps) => {
        const u = r.workspaceMember.user;
        return {
          id: u.id,
          name: u.name ?? "unknown",
          avatar: u.avatar ?? undefined,
          username: u.username ?? "",
          role: r.role ?? "Member",
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
