import { memberProps, prismaUserProp } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom, zodApiError } from "@/lib/functions/error/apiError";
import { cursorSearchSchema } from "@/lib/functions/route/cursorSearchSchema";
import { projectRole } from "@/lib/serviceLayer/project/projectRole";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { User } from "@supabase/supabase-js";
type workspaceMemberId = {
  workspaceMemberUserId: string;
};
export const GET = withAuth(
  async (
    user: User,
    req: Request,
    {
      params: paramsPromise,
    }: { params: Promise<{ id: string; projectId: string }> },
  ) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    const projectId = params.projectId;
    const { searchParams } = new URL(req.url);
    const queryObj = Object.fromEntries(searchParams.entries());
    if (!workspaceId || !projectId) {
      return apiErrorCustom("Invalid parameters");
    }
    const limit = 10;
    try {
      const { search, cursor } = cursorSearchSchema.parse(queryObj);
      const userWsRole = await wsRole(user.id, workspaceId);
      if (!userWsRole) {
        return apiErrorCustom("You are not authorised");
      }
      if (userWsRole !== "Owner" && userWsRole !== "Admin") {
        const userProjectRole = await projectRole(
          user.id,
          workspaceId,
          projectId,
        );
        if (!userProjectRole || userProjectRole === "Viewer") {
          return apiErrorCustom("You are not authorised");
        }
      }
      const projectMemberIds = (
        await prisma.projectMember.findMany({
          where: {
            projectId,
            workspaceMemberWsId: workspaceId,
          },
          select: {
            workspaceMemberUserId: true,
          },
        })
      ).map((p: workspaceMemberId) => p.workspaceMemberUserId);
      const rows = await prisma.workspaceMember.findMany({
        where: {
          workspaceId,
          userId: {
            notIn: projectMemberIds,
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
      const users: memberProps[] = requiredRows.map((w: prismaUserProp) => ({
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
