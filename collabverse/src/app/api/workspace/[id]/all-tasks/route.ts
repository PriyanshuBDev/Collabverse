import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom, zodApiError } from "@/lib/functions/error/apiError";
import { searchTaskBuilder } from "@/lib/serviceLayer/task/taskBuilder";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { Prisma } from "@prisma/client";
import { User } from "@supabase/supabase-js";
import z from "zod";
const getTasksSchema = z.object({
  page: z.coerce.number(),
  search: z.string().trim().min(2),
});
export const GET = withAuth(
  async (user: User, req: Request, { params }: { params: { id: string } }) => {
    const workspaceId = params.id;
    const { searchParams } = new URL(req.url);
    const queryObj = Object.fromEntries(searchParams.entries());
    if (!workspaceId) {
      return apiErrorCustom("Invalid parameters");
    }
    try {
      const { search, page } = getTasksSchema.parse(queryObj);
      const pageLimit = 10;
      const userWsRole = await wsRole(user.id, workspaceId);
      if (!userWsRole) {
        return apiErrorCustom("You are not authorised");
      }
      const where: Prisma.TaskWhereInput = {
        name: search ? { contains: search, mode: "insensitive" } : undefined,
      };
      const pageNum = Number(page);
      const [tasksRes, total] = await Promise.all([
        prisma.task.findMany({
          where,
          orderBy: {
            name: "asc",
          },
          skip: (pageNum - 1) * pageLimit,
          take: pageLimit,
          select: {
            id: true,
            slug: true,
            name: true,
            status: true,
            createdAt: true,
            dueDate: true,
            priority: true,
            description: true,
            position: true,
            members: {
              take: 5,
              select: {
                projectMember: {
                  select: {
                    workspaceMember: {
                      select: {
                        user: {
                          select: {
                            id: true,
                            name: true,
                            avatar: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            _count: {
              select: {
                attachments: true,
                members: true,
                subtasks: true,
                comments: true,
              },
            },
            project: {
              select: {
                slug: true,
                members: {
                  where: {
                    workspaceMemberUserId: user.id,
                  },
                  select: {
                    role: true,
                  },
                },
              },
            },
          },
        }),
        prisma.task.count({ where }),
      ]);
      console.log(tasksRes);
      const tasks = await searchTaskBuilder(tasksRes, user.id, userWsRole);
      return Response.json(
        { tasks, total, limit: pageLimit, page: pageNum },
        { status: 200 },
      );
    } catch (e) {
      return zodApiError(e);
    }
  },
);
