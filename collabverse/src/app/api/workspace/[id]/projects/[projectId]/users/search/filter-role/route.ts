import { ProjectMembersProps } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom, zodApiError } from "@/lib/functions/error/apiError";
import { projectRole } from "@/lib/serviceLayer/project/projectRole";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { $Enums, PRole } from "@prisma/client";
import { User } from "@supabase/supabase-js";
import z from "zod";
type userProp = {
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
const projectUsersFilteredByRoleSchema = z.object({
  search: z.string().trim().min(2).optional(),
  role: z.enum(PRole).optional(),
  cursor: z.uuid().optional(),
});
export const GET = withAuth(
  async (
    user: User,
    req: Request,
    { params }: { params: { id: string; projectId: string } },
  ) => {
    const workspaceId = params.id;
    const projectId = params.projectId;
    const { searchParams } = new URL(req.url);
    const queryObj = Object.fromEntries(searchParams.entries());
    if (!workspaceId || !projectId) {
      return apiErrorCustom("Invalid parameters");
    }
    const limit = 10;
    try {
      const { role, search, cursor } =
        projectUsersFilteredByRoleSchema.parse(queryObj);

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
      const rows = await prisma.projectMember.findMany({
        where: {
          workspaceMemberWsId: workspaceId,
          projectId,
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
          ...(role !== undefined && {
            role: {
              not: role,
            },
          }),
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
      const users: ProjectMembersProps[] = requiredRows.map((r: userProp) => {
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
