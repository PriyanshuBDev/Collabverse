import { wsUserProps } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { projectRole } from "@/lib/serviceLayer/project/projectRole";
import { taskRole } from "@/lib/serviceLayer/task/taskRole";
import { isWorkspaceMember } from "@/lib/serviceLayer/workspace/isWorkspaceMember";
import {
  getProjectCursorPagination,
  getProjectOffsetPagination,
  getTaskCursorPagination,
  getTaskOffsetPagination,
  getWorkspaceCursorPagination,
  getWorkspaceOffsetPagination,
} from "@/lib/serviceLayer/workspace/users/pagination";
import {
  projectAndTasksBuilder,
  taskBuilder,
} from "@/lib/serviceLayer/workspace/users/projectsAndTasks";
import {
  projectSelect,
  projectWhere,
  taskSelect,
  taskWhere,
  workspaceSelect,
  workspaceWhere,
} from "@/lib/serviceLayer/workspace/users/whereAndSelect";
import { $Enums, PRole, TaskRole, WsRole } from "@prisma/client";
import { User } from "@supabase/supabase-js";
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
export interface BaseMemberProps {
  user: {
    name: string | null;
    id: string;
    avatar: string | null;
    username: string | null;
  };
  role: WsRole | PRole | TaskRole;
  joinedAt: Date;
  assignedTasksInProject?: number;
}

export const GET = withAuth(
  async (user: User, req: Request, { params }: { params: { id: string } }) => {
    const workspaceId = params.id;
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode");
    const cursorId = searchParams.get("cursorId");
    const search = searchParams.get("search");
    const page = searchParams.get("page");
    const projectId = searchParams.get("projectId");
    const taskId = searchParams.get("taskId");

    const offsetPageSize = 20;
    const cursorPageSize = 10;
    if (!workspaceId || !mode) {
      return new Response("Invalid parameters", { status: 400 });
    }
    try {
      let allowed: boolean;
      if (workspaceId && projectId && taskId) {
        const tRole = await taskRole(user.id, taskId);
        allowed = !!tRole;
      } else if (workspaceId && projectId && !taskId) {
        const pRole = await projectRole(user.id, workspaceId, projectId);
        allowed = !!pRole;
      } else {
        allowed = await isWorkspaceMember(user.id, workspaceId);
      }
      if (!allowed) {
        return new Response("You are not authorised", { status: 403 });
      }
      const wsWhere = workspaceWhere(workspaceId, search);
      const wsSelect = workspaceSelect();
      const prWhere = projectWhere(projectId, workspaceId, search);
      const prSelect = projectSelect();
      const tWhere = taskWhere(taskId, projectId, workspaceId, search);
      const tSelect = taskSelect();
      if (mode === "offset") {
        const pageNumber = Number(page);
        if (!pageNumber || pageNumber < 1) {
          return new Response("Required page number not found", {
            status: 400,
          });
        }

        let total: number;
        if (workspaceId && projectId && taskId) {
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
          const members: BaseMemberProps[] = res.map((r: resProp) => ({
            role: r.role,
            joinedAt: r.joinedAt,
            user: r.projectMember.workspaceMember.user,
          }));
          const users = await userBuilder(members, "task");
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
        } else if (workspaceId && projectId && !taskId) {
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
          const members: BaseMemberProps[] = res.map((r: resProp1) => ({
            role: r.role,
            joinedAt: r.joinedAt,
            user: r.workspaceMember.user,
            assignedTasksInProject: r._count.taskMemberShips,
          }));
          const users = await userBuilder(
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
        } else {
          const pagination = getWorkspaceOffsetPagination(
            pageNumber,
            offsetPageSize,
          );
          const res: BaseMemberProps[] = await prisma.workspaceMember.findMany({
            where: wsWhere,
            ...pagination,
            select: wsSelect,
          });
          total = await prisma.workspaceMember.count({ where: wsWhere });
          const users = await userBuilder(res, "workspace", workspaceId);
          return Response.json(
            {
              users,
              total,
              page: pageNumber,
              limit: offsetPageSize,
              type: "Workspace",
            },
            { status: 200 },
          );
        }
      }
      if (mode === "cursor") {
        if (workspaceId && projectId && taskId) {
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
          const members: BaseMemberProps[] = requiredRows.map((r: resProp) => ({
            role: r.role,
            joinedAt: r.joinedAt,
            user: r.projectMember.workspaceMember.user,
          }));

          const last = members.length > 0 ? members[members.length - 1] : null;
          return Response.json(
            {
              users: await userBuilder(members, "task"),
              nextCursor: hasMore && last ? last.user.id : null,
              hasMore,
              type: "Task",
            },
            { status: 200 },
          );
        } else if (workspaceId && projectId && !taskId) {
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
          const members: BaseMemberProps[] = requiredRows.map(
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
              users: await userBuilder(
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
        } else {
          const cursorPagination = getWorkspaceCursorPagination(
            cursorId,
            cursorPageSize,
            workspaceId,
          );
          const rows: BaseMemberProps[] = await prisma.workspaceMember.findMany(
            {
              where: wsWhere,
              ...cursorPagination,
              select: wsSelect,
            },
          );
          const hasMore = rows.length > cursorPageSize;
          const members = hasMore ? rows.slice(0, cursorPageSize) : rows;
          const last = members.length > 0 ? members[members.length - 1] : null;
          return Response.json(
            {
              users: await userBuilder(members, "workspace", workspaceId),
              nextCursor: hasMore && last ? last.user.id : null,
              hasMore,
              type: "Workspace",
            },
            { status: 200 },
          );
        }
      }
      return new Response("Invalid mode", { status: 400 });
    } catch (e) {
      console.error(e);
      return new Response("Something went wrong", { status: 500 });
    }
  },
);

async function userBuilder(
  members: BaseMemberProps[],
  level: "workspace" | "project" | "task",
  workspaceId?: string,
  projectId?: string,
): Promise<wsUserProps[]> {
  const userIds = members.map((m: BaseMemberProps) => m.user.id);
  if (userIds.length === 0) return [];
  try {
    if (level === "workspace" && workspaceId) {
      const res = await projectAndTasksBuilder(workspaceId, members, userIds);
      return res;
    } else if (level === "project" && workspaceId && projectId) {
      const res = await taskBuilder(workspaceId, projectId, members, userIds);
      return res;
    } else {
      return members.map((m: BaseMemberProps) => {
        return {
          id: m.user.id,
          name: m.user.name ?? "unknown",
          username: m.user.username ?? "unknown",
          avatar: m.user.avatar ?? undefined,
          joinedAt: m.joinedAt,
          role: m.role,
        };
      });
    }
  } catch (e) {
    console.log("Error encountered while building users", e);
    throw e;
  }
}
