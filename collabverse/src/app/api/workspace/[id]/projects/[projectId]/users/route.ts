import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiError } from "@/lib/functions/error/apiError";
import { projectRole } from "@/lib/serviceLayer/project/projectRole";
import { taskRole } from "@/lib/serviceLayer/task/taskRole";
import {
  getProjectCursorPagination,
  getProjectOffsetPagination,
  getTaskCursorPagination,
  getTaskOffsetPagination,
} from "@/lib/serviceLayer/workspace/users/pagination";
import {
  projectSelect,
  projectWhere,
  taskSelect,
  taskWhere,
} from "@/lib/serviceLayer/workspace/users/whereAndSelect";
import { User } from "@supabase/supabase-js";
import { projectBasedRole } from "@/app/interfaces";
import { projectUserBuilder } from "@/lib/serviceLayer/project/users/extra";
import { $Enums } from "@prisma/client";

export interface projectBaseMemberProps {
  user: {
    name: string | null;
    id: string;
    avatar: string | null;
    username: string | null;
  };
  role: projectBasedRole;
  joinedAt: Date;
  assignedTasksInProject?: number;
}
type resProp = {
  role: $Enums.TaskRole;
  joinedAt: Date;
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
};
type resProp1 = {
  role: $Enums.PRole;
  joinedAt: Date;
  workspaceMember: {
    user: {
      id: string;
      name: string | null;
      avatar: string | null;
      username: string | null;
    };
  };
  _count: {
    taskMemberShips: number;
  };
};
export const GET = withAuth(
  async (
    user: User,
    req: Request,
    { params: paramsPromise }: { params: Promise<{ id: string; projectId: string }> },
  ) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    const projectId = params.projectId;
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode");
    const cursorId = searchParams.get("cursorId");
    const search = searchParams.get("search");
    const page = searchParams.get("page");
    const taskId = searchParams.get("taskId");

    const offsetPageSize = 20;
    const cursorPageSize = 10;
    if (!workspaceId || !mode || !projectId) {
      return apiError("Invalid parameters", 400);
    }
    try {
      let allowed: boolean;
      if (taskId) {
        const tRole = await taskRole(user.id, taskId);
        allowed = !!tRole;
      } else {
        const pRole = await projectRole(user.id, workspaceId, projectId);
        allowed = !!pRole;
      }
      if (!allowed) {
        return apiError("You are not authorised", 403);
      }

      const prWhere = projectWhere(projectId, workspaceId, search);
      const prSelect = projectSelect();
      const tWhere = taskWhere(taskId, projectId, workspaceId, search);
      const tSelect = taskSelect();
      if (mode === "offset") {
        const pageNumber = Number(page);
        if (!pageNumber || pageNumber < 1) {
          return apiError("Required page number not found", 400);
        }

        let total: number;
        if (taskId) {
          const pagination = getTaskOffsetPagination(
            pageNumber,
            offsetPageSize,
          );
          const res = await prisma.taskMember.findMany({
            where: tWhere,
            ...pagination,
            select: tSelect,
          });
          total = await prisma.taskMember.count({ where: tWhere });
          const members: projectBaseMemberProps[] = res.map((r: resProp) => ({
            role: r.role,
            joinedAt: r.joinedAt,
            user: r.projectMember.workspaceMember.user,
          }));
          const users = await projectUserBuilder(members, "task");
          return Response.json(
            {
              users,
              total,
              page: pageNumber,
              limit: offsetPageSize,
              type: "Task",
            },
            { status: 200 },
          );
        } else {
          const pagination = getProjectOffsetPagination(
            pageNumber,
            offsetPageSize,
          );
          const res = await prisma.projectMember.findMany({
            where: prWhere,
            ...pagination,
            select: prSelect,
          });
          total = await prisma.projectMember.count({ where: prWhere });
          const members: projectBaseMemberProps[] = res.map((r: resProp1) => ({
            role: r.role,
            joinedAt: r.joinedAt,
            user: r.workspaceMember.user,
            assignedTasksInProject: r._count.taskMemberShips,
          }));
          const users = await projectUserBuilder(
            members,
            "project",
            workspaceId,
            projectId,
          );
          return Response.json(
            {
              users,
              total,
              page: pageNumber,
              limit: offsetPageSize,
              type: "Project",
            },
            { status: 200 },
          );
        }
      }
      if (mode === "cursor") {
        if (taskId) {
          const cursorPagination = getTaskCursorPagination(
            cursorId,
            cursorPageSize,
            workspaceId,
            projectId,
            taskId,
          );
          const rows = await prisma.taskMember.findMany({
            where: tWhere,
            ...cursorPagination,
            select: tSelect,
          });
          const hasMore = rows.length > cursorPageSize;
          const requiredRows = hasMore ? rows.slice(0, cursorPageSize) : rows;
          const members: projectBaseMemberProps[] = requiredRows.map(
            (r: resProp) => ({
              role: r.role,
              joinedAt: r.joinedAt,
              user: r.projectMember.workspaceMember.user,
            }),
          );

          const last = members.length > 0 ? members[members.length - 1] : null;
          return Response.json(
            {
              users: await projectUserBuilder(members, "task"),
              nextCursor: hasMore && last ? last.user.id : null,
              hasMore,
              type: "Task",
            },
            { status: 200 },
          );
        } else {
          const cursorPagination = getProjectCursorPagination(
            cursorId,
            cursorPageSize,
            workspaceId,
            projectId,
          );
          const rows = await prisma.projectMember.findMany({
            where: prWhere,
            ...cursorPagination,
            select: prSelect,
          });
          const hasMore = rows.length > cursorPageSize;
          const requiredRows = hasMore ? rows.slice(0, cursorPageSize) : rows;
          const members: projectBaseMemberProps[] = requiredRows.map(
            (r: resProp1) => ({
              role: r.role,
              joinedAt: r.joinedAt,
              user: r.workspaceMember.user,
              assignedTasksInProject: r._count.taskMemberShips,
            }),
          );

          const last = members.length > 0 ? members[members.length - 1] : null;
          return Response.json(
            {
              users: await projectUserBuilder(
                members,
                "project",
                workspaceId,
                projectId,
              ),
              nextCursor: hasMore && last ? last.user.id : null,
              hasMore,
              type: "Project",
            },
            { status: 200 },
          );
        }
      }
      return apiError("Invalid mode", 400);
    } catch {
      return apiError("Something went wrong", 500);
    }
  },
);
