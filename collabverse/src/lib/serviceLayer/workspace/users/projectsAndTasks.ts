import { BaseMemberProps } from "@/app/api/workspace/[id]/users/route";
import { wsUserProps } from "@/app/interfaces";
import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
type projectCountProp = Prisma.PickEnumerable<
  Prisma.ProjectMemberGroupByOutputType,
  "workspaceMemberUserId"[]
> & {
  _count: {
    workspaceMemberUserId: number;
  };
};
type taskCountProp = Prisma.PickEnumerable<
  Prisma.TaskMemberGroupByOutputType,
  "projectMemberUserId"[]
> & {
  _count: {
    projectMemberUserId: number;
  };
};
type ownedProjectProp = Prisma.PickEnumerable<
  Prisma.ProjectGroupByOutputType,
  "currentOwnerId"[]
> & {
  _count: {
    currentOwnerId: number;
  };
};
export async function projectAndTasksBuilder(
  workspaceId: string,
  members: BaseMemberProps[],
  userIds: string[],
): Promise<wsUserProps[]> {
  const projectCounts = await prisma.projectMember.groupBy({
    by: ["workspaceMemberUserId"],
    where: {
      workspaceMemberUserId: { in: userIds },
      workspaceMemberWsId: workspaceId,
    },
    _count: {
      workspaceMemberUserId: true,
    },
  });
  const taskCounts = await prisma.taskMember.groupBy({
    by: ["projectMemberUserId"],
    where: {
      projectMemberUserId: { in: userIds },
      task: { workspaceId },
    },
    _count: {
      projectMemberUserId: true,
    },
  });
  const ownedProjects = await prisma.project.groupBy({
    by: ["currentOwnerId"],
    where: {
      currentOwnerId: { in: userIds },
      workspaceId,
    },
    _count: {
      currentOwnerId: true,
    },
  });
  const projectMap = new Map(
    projectCounts.map((p: projectCountProp) => [
      p.workspaceMemberUserId,
      p._count.workspaceMemberUserId,
    ]),
  );
  const taskMap = new Map(
    taskCounts.map((t: taskCountProp) => [
      t.projectMemberUserId,
      t._count.projectMemberUserId,
    ]),
  );
  const ownedProjectsMap = new Map(
    ownedProjects.map((o: ownedProjectProp) => [
      o.currentOwnerId,
      o._count.currentOwnerId,
    ]),
  );

  return members.map((m: BaseMemberProps) => {
    return {
      id: m.user.id,
      name: m.user.name ?? "unknown",
      username: m.user.username ?? "unknown",
      avatar: m.user.avatar ?? undefined,
      joinedAt: m.joinedAt,
      tasks: taskMap.get(m.user.id) ?? 0,
      projects: projectMap.get(m.user.id) ?? 0,
      role: m.role,
      ownedProjects: ownedProjectsMap.get(m.user.id) ?? 0,
    };
  });
}

export async function taskBuilder(
  workspaceId: string,
  projectId: string,
  members: BaseMemberProps[],
  userIds: string[],
): Promise<wsUserProps[]> {
  const taskCounts = await prisma.taskMember.groupBy({
    by: ["projectMemberUserId"],
    where: {
      projectMemberUserId: { in: userIds },
      task: { workspaceId, projectId },
    },
    _count: {
      projectMemberUserId: true,
    },
  });
  const taskMap = new Map(
    taskCounts.map((t: taskCountProp) => [
      t.projectMemberUserId,
      t._count.projectMemberUserId,
    ]),
  );
  return members.map((m: BaseMemberProps) => {
    return {
      id: m.user.id,
      name: m.user.name ?? "unknown",
      username: m.user.username ?? "unknown",
      avatar: m.user.avatar ?? undefined,
      joinedAt: m.joinedAt,
      tasks: taskMap.get(m.user.id) ?? 0,
      role: m.role,
      assignedTasksInProject: m.assignedTasksInProject ?? 0,
    };
  });
}
