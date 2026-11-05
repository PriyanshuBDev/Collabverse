import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { getCalendarRange } from "@/lib/functions/date/getCalendarRange";
import { apiError, apiErrorCustom } from "@/lib/functions/error/apiError";
import { projectRole } from "@/lib/serviceLayer/project/projectRole";
import { taskBuilder } from "@/lib/serviceLayer/task/taskBuilder";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { Priority, Prisma, PRole, TaskStatus } from "@prisma/client";
import { User } from "@supabase/supabase-js";
import z, { ZodError } from "zod";
export interface baseTaskProps {
  status: TaskStatus;
  priority: Priority;
  name: string;
  id: string;
  slug: string;
  createdAt: Date;
  description: string | null;
  dueDate: Date;
  project: {
    members: {
      role: PRole;
    }[];
  };
  _count: {
    members: number;
    subtasks: number;
    attachments: number;
    comments: number;
  };
  position: number;
  members: {
    projectMember: {
      workspaceMember: {
        user: {
          name: string | null;
          id: string;
          avatar: string | null;
        };
      };
    };
  }[];
}
const getTasksQuerySchema = z.object({
  view: z.enum(["table", "board", "calendar"]),
  lastPosition: z.coerce.number().optional(),
  page: z.coerce.number().optional(),
  date: z.coerce.date().optional(),
  status: z.enum(TaskStatus).optional(),
  priority: z.enum(Priority).optional(),
  due: z.coerce.date().optional(),
  assignedTo: z.uuid().optional(),
  search: z.string().trim().min(2).optional(),
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
    const pageLimit = 10;
    const boardLimit = 6;

    if (!workspaceId || !projectId) {
      return apiErrorCustom("Invalid parameters");
    }
    try {
      const {
        view,
        lastPosition,
        page,
        search,
        status,
        priority,
        date,
        due,
        assignedTo,
      } = getTasksQuerySchema.parse(queryObj);
      const userWsRole = await wsRole(user.id, workspaceId);
      if (!userWsRole) {
        return apiErrorCustom("You are not authorised");
      }
      let userProjectRole: PRole | undefined;
      if (userWsRole !== "Owner" && userWsRole !== "Admin") {
        userProjectRole = await projectRole(user.id, workspaceId, projectId);
        if (!userProjectRole) {
          return apiErrorCustom("You are not authorised");
        }
      }
      const where: Prisma.TaskWhereInput = {
        projectId,
      };

      if (status) {
        where.status = status;
      }
      if (assignedTo) {
        where.members = {
          some: {
            projectMemberUserId: assignedTo,
          },
        };
      }
      if (priority) {
        where.priority = priority;
      }
      if (due && date) {
        return apiError("Cannot use both due and date filters", 400);
      }
      if (due) {
        const start = new Date(due);
        const end = new Date(due);
        end.setDate(end.getDate() + 1);

        where.dueDate = {
          gte: start,
          lt: end,
        };
      }
      if (date) {
        const { startDate, endDate } = getCalendarRange(date);
        where.dueDate = {
          gte: startDate,
          lte: endDate,
        };
      }
      if (search) {
        where.name = { contains: search, mode: "insensitive" };
      }
      const select = {
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
      };
      if (view === "table") {
        if (page === undefined) {
          return apiError("Table view requires page", 400);
        }
        const pageNum = Number(page);
        const [tasksRes, total] = await Promise.all([
          prisma.task.findMany({
            where,
            orderBy: {
              name: "asc",
            },
            skip: (pageNum - 1) * pageLimit,
            take: pageLimit,
            select,
          }),
          prisma.task.count({ where }),
        ]);
        const tasks = await taskBuilder(tasksRes, user.id, userWsRole);
        return Response.json({ tasks, total, limit: pageLimit, page: pageNum });
      }
      if (view === "board") {
        if (!status) {
          return apiError("Status is required for board view", 400);
        }
        where.status = status;
        if (lastPosition) {
          where.position = {
            gt: lastPosition,
          };
        }
        const tasksRes = await prisma.task.findMany({
          where,
          orderBy: [{ position: "asc" }, { id: "asc" }],
          take: boardLimit + 1,
          select,
        });
        const hasMore = tasksRes.length > boardLimit;
        const requiredTasks = hasMore
          ? tasksRes.slice(0, boardLimit)
          : tasksRes;
        const tasks = await taskBuilder(requiredTasks, user.id, userWsRole);
        return Response.json({ tasks, hasMore }, { status: 200 });
      }
      if (view === "calendar") {
        if (!date) {
          return apiError("Calendar view requires date", 400);
        }
        const tasksRes = await prisma.task.findMany({
          where,
          orderBy: [{ dueDate: "asc" }, { id: "asc" }],
          select,
        });
        const tasks = await taskBuilder(tasksRes, user.id, userWsRole);
        return Response.json({ tasks });
      }
      return apiErrorCustom("Invalid data");
    } catch (e) {
      if (e instanceof ZodError) {
        return Response.json(
          { errors: e.flatten().fieldErrors },
          { status: 400 },
        );
      }
      console.log(e);
      return apiErrorCustom("Something went wrong");
    }
  },
);
