import { baseTaskProps } from "@/app/api/workspace/[id]/projects/[projectId]/tasks/route";
import { searchTaskProps, viewTasksProps } from "@/app/interfaces";
import { prisma } from "@/lib/db/prisma";
import { taskLevelAuthority } from "@/lib/functions/task/taskLevelAuthority";
import { $Enums, Prisma, WsRole } from "@prisma/client";
type taskRoleProp = {
  taskId: string;
  role: $Enums.TaskRole;
};
type doneTaskCountProp = Prisma.PickEnumerable<
  Prisma.SubtaskGroupByOutputType,
  "taskId"[]
> & {
  _count: number;
};
type proMemProp = {
  projectMember: {
    workspaceMember: {
      user: {
        name: string | null;
        id: string;
        avatar: string | null;
      };
    };
  };
};
export async function taskBuilder(
  tasksRes: baseTaskProps[],
  userId: string,
  wsRole: WsRole,
): Promise<viewTasksProps[]> {
  if (tasksRes.length === 0) {
    return [];
  }
  const taskIds = tasksRes.map((t: baseTaskProps) => t.id);
  const currentUserMemberships = await prisma.taskMember.findMany({
    where: {
      taskId: {
        in: taskIds,
      },
      projectMemberUserId: userId,
    },
    select: {
      taskId: true,
      role: true,
    },
  });
  const roleMap = new Map(
    currentUserMemberships.map((m: taskRoleProp) => [m.taskId, m.role]),
  );
  const doneSubtasksCount = await prisma.subtask.groupBy({
    by: ["taskId"],
    where: {
      taskId: {
        in: taskIds,
      },
      done: true,
    },
    _count: true,
  });
  const doneMap = new Map(
    doneSubtasksCount.map((d: doneTaskCountProp) => [d.taskId, d._count]),
  );
  const tasks: viewTasksProps[] = tasksRes.map((t: baseTaskProps) => {
    const projectRole = t.project?.members[0]?.role ?? undefined;
    const taskRole = roleMap.get(t.id);
    const currentUserTaskRole = taskLevelAuthority(
      wsRole,
      projectRole,
      taskRole,
    );
    return {
      id: t.id,
      slug: t.slug,
      name: t.name,
      dueDate: t.dueDate,
      createdAt: t.createdAt,
      priority: t.priority,
      members: t.members.map((m: proMemProp) => {
        const user = m.projectMember.workspaceMember.user;
        return {
          id: user.id,
          name: user.name ?? "unknown",
          avatar: user.avatar ?? undefined,
        };
      }),
      comments: t._count.comments || 0,
      attachments: t._count.attachments || 0,
      totalMembers: t._count.members || 0,
      position: t.position,
      status: t.status,
      description: t.description ?? undefined,
      totalSubtasks: t._count.subtasks,
      doneSubtasks: doneMap.get(t.id) || 0,
      currentUserTaskRole,
    };
  });
  return tasks;
}
interface searchBaseTaskProps {
  id: string;
  name: string;
  _count: {
    comments: number;
    attachments: number;
    subtasks: number;
    members: number;
  };
  description: string | null;
  createdAt: Date;
  project: {
    slug: string;
    members: {
      role: $Enums.PRole;
    }[];
  };
  slug: string;
  priority: $Enums.Priority;
  status: $Enums.TaskStatus;
  dueDate: Date;
  position: number;
  members: {
    projectMember: {
      workspaceMember: {
        user: {
          id: string;
          name: string | null;
          avatar: string | null;
        };
      };
    };
  }[];
}

export async function searchTaskBuilder(
  tasksRes: searchBaseTaskProps[],
  userId: string,
  wsRole: WsRole,
): Promise<searchTaskProps[]> {
  if (tasksRes.length === 0) {
    return [];
  }
  const taskIds = tasksRes.map((t: searchBaseTaskProps) => t.id);
  const currentUserMemberships = await prisma.taskMember.findMany({
    where: {
      taskId: {
        in: taskIds,
      },
      projectMemberUserId: userId,
    },
    select: {
      taskId: true,
      role: true,
    },
  });
  const roleMap = new Map(
    currentUserMemberships.map((m: taskRoleProp) => [m.taskId, m.role]),
  );
  const doneSubtasksCount = await prisma.subtask.groupBy({
    by: ["taskId"],
    where: {
      taskId: {
        in: taskIds,
      },
      done: true,
    },
    _count: true,
  });
  const doneMap = new Map(
    doneSubtasksCount.map((d: doneTaskCountProp) => [d.taskId, d._count]),
  );
  const tasks: searchTaskProps[] = tasksRes.map((t: searchBaseTaskProps) => {
    const projectRole = t.project?.members[0]?.role ?? undefined;
    const taskRole = roleMap.get(t.id);
    const currentUserTaskRole = taskLevelAuthority(
      wsRole,
      projectRole,
      taskRole,
    );
    return {
      id: t.id,
      slug: t.slug,
      name: t.name,
      dueDate: t.dueDate,
      createdAt: t.createdAt,
      priority: t.priority,
      members: t.members.map((m: proMemProp) => {
        const user = m.projectMember.workspaceMember.user;
        return {
          id: user.id,
          name: user.name ?? "unknown",
          avatar: user.avatar ?? undefined,
        };
      }),
      comments: t._count.comments || 0,
      attachments: t._count.attachments || 0,
      totalMembers: t._count.members || 0,
      position: t.position,
      status: t.status,
      description: t.description ?? undefined,
      totalSubtasks: t._count.subtasks,
      doneSubtasks: doneMap.get(t.id) || 0,
      currentUserTaskRole,
      projectRole: t.project.members.at(0)?.role ?? "Viewer",
      projectSlug: t.project.slug,
    };
  });
  return tasks;
}
