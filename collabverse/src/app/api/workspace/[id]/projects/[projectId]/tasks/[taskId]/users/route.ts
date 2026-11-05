import { taskUserProps } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom } from "@/lib/functions/error/apiError";
import { taskAuthority } from "@/lib/serviceLayer/task/taskAuthority";
import { $Enums } from "@prisma/client";
import { User } from "@supabase/supabase-js";
type resProp = {
  projectMember: {
    workspaceMember: {
      user: {
        id: string;
        name: string | null;
        avatar: string | null;
        username: string | null;
      };
    };
  };
  role: $Enums.TaskRole;
  joinedAt: Date;
};
export const GET = withAuth(
  async (
    user: User,
    req: Request,
    { params: paramsPromise }: { params: Promise<{ id: string; projectId: string; taskId: string }> },
  ) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    const projectId = params.projectId;
    const taskId = params.taskId;
    const { searchParams } = new URL(req.url);
    const cursorId = searchParams.get("cursor") || undefined;
    const search = searchParams.get("search")?.trim() || undefined;
    if (!workspaceId || !projectId || !taskId) {
      return apiErrorCustom("Invalid parameters");
    }
    const limit = 10;

    try {
      const access = await taskAuthority(
        user.id,
        workspaceId,
        projectId,
        taskId,
      );
      if (!access.success) {
        return apiErrorCustom("You are not authorised");
      }
      const rows = await prisma.taskMember.findMany({
        where: {
          taskId,
          projectId,
          workspaceId,
          ...(search !== undefined &&
            search.length > 1 && {
              projectMember: {
                workspaceMember: {
                  user: {
                    OR: [
                      { name: { contains: search, mode: "insensitive" } },
                      { username: { contains: search, mode: "insensitive" } },
                    ],
                  },
                },
              },
            }),
        },
        take: limit + 1,
        skip: cursorId ? 1 : 0,
        cursor: cursorId
          ? {
              projectMemberUserId_taskId: {
                projectMemberUserId: cursorId,
                taskId,
              },
            }
          : undefined,
        orderBy: [
          {
            projectMemberUserId: "asc",
          },
          { role: "asc" },
        ],
        select: {
          joinedAt: true,
          role: true,
          projectMember: {
            select: {
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
          },
        },
      });
      const hasMore = rows.length > limit;
      const requiredRows = hasMore ? rows.slice(0, limit) : rows;
      const users: taskUserProps[] = requiredRows.map((r: resProp) => {
        const u = r.projectMember.workspaceMember.user;
        return {
          id: u.id,
          name: u.name ?? "unknown",
          avatar: u.avatar ?? undefined,
          username: u.username ?? "",
          role: r.role,
          joinedAt: r.joinedAt,
        };
      });
      const last = users.length > 0 ? users[users.length - 1] : null;
      return Response.json(
        { users, nextCursor: hasMore && last ? last.id : null, hasMore },
        { status: 200 },
      );
    } catch (e) {
      console.log(e);
      return apiErrorCustom("Something went wrong");
    }
  },
);
