import { ProjectMembersProps, projMemberUserIdProp } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom, zodApiError } from "@/lib/functions/error/apiError";
import { cursorSearchSchema } from "@/lib/functions/route/cursorSearchSchema";
import { projectRole } from "@/lib/serviceLayer/project/projectRole";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { $Enums } from "@prisma/client";
import { User } from "@supabase/supabase-js";
type prop = {
  role: $Enums.PRole;
  workspaceMember: {
    user: {
      id: string;
      name: string | null;
      avatar: string | null;
      username: string | null;
    };
  };
};

export const GET = withAuth(
  async (
    user: User,
    req: Request,
    {
      params: paramsPromise,
    }: { params: Promise<{ id: string; projectId: string; taskId: string }> },
  ) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    const projectId = params.projectId;
    const taskId = params.taskId;
    const { searchParams } = new URL(req.url);
    const queryObj = Object.fromEntries(searchParams.entries());
    if (!workspaceId || !projectId || !taskId) {
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
        if (
          !userProjectRole ||
          (userProjectRole !== "Owner" && userProjectRole !== "Manager")
        ) {
          return apiErrorCustom("You are not authorised");
        }
      }
      const taskUserIds = (
        await prisma.taskMember.findMany({
          where: {
            workspaceId,
            projectId,
            taskId,
          },
          select: {
            projectMemberUserId: true,
          },
        })
      ).map((t: projMemberUserIdProp) => t.projectMemberUserId);

      const rows = await prisma.projectMember.findMany({
        where: {
          workspaceMemberWsId: workspaceId,
          projectId,
          workspaceMemberUserId: {
            notIn: taskUserIds,
          },
          ...(search !== undefined &&
            search.length > 1 && {
              workspaceMember: {
                user: {
                  OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { username: { contains: search, mode: "insensitive" } },
                  ],
                },
              },
            }),
          role: {
            not: "Viewer",
          },
        },
        take: limit + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor
          ? {
              workspaceMemberUserId_workspaceMemberWsId_projectId: {
                workspaceMemberUserId: cursor,
                workspaceMemberWsId: workspaceId,
                projectId,
              },
            }
          : undefined,
        orderBy: [
          {
            workspaceMemberUserId: "asc",
          },
          { joinedAt: "asc" },
        ],
        select: {
          role: true,
          workspaceMember: {
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
          },
        },
      });
      const hasMore = rows.length > limit;
      const requiredRows = hasMore ? rows.slice(0, limit) : rows;
      const users: ProjectMembersProps[] = requiredRows.map((r: prop) => {
        const u = r.workspaceMember.user;
        return {
          id: u.id,
          name: u.name ?? "unknown",
          avatar: u.avatar ?? undefined,
          username: u.username ?? "",
          role: r.role,
        };
      });
      const last = users.length > 0 ? users[users.length - 1] : null;
      return Response.json(
        { users, nextCursor: hasMore && last ? last.id : null, hasMore },
        { status: 200 },
      );
    } catch (e) {
      console.log(e);
      return zodApiError(e);
    }
  },
);
