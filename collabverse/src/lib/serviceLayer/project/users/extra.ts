import { projectBaseMemberProps } from "@/app/api/workspace/[id]/projects/[projectId]/users/route";
import { projectUserProps } from "@/app/interfaces";
import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
type taskCountProp = Prisma.PickEnumerable<
  Prisma.TaskMemberGroupByOutputType,
  "projectMemberUserId"[]
> & {
  _count: {
    projectMemberUserId: number;
  };
};
export async function projectTaskBuilder(
  workspaceId: string,
  projectId: string,
  members: projectBaseMemberProps[],
  userIds: string[],
): Promise<projectUserProps[]> {
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
  return members.map((m: projectBaseMemberProps) => {
    return {
      id: m.user.id,
      name: m.user.name ?? "unknown",
      username: m.user.username ?? "unknown",
      avatar: m.user.avatar ?? undefined,
      joinedAt: m.joinedAt,
      tasks: taskMap.get(m.user.id) ?? 0,
      role: m.role,
      assignedTasksInProject: m.assignedTasksInProject,
    };
  });
}
export async function projectUserBuilder(
  members: projectBaseMemberProps[],
  level: "project" | "task",
  workspaceId?: string,
  projectId?: string,
): Promise<projectUserProps[]> {
  const userIds = members.map((m: projectBaseMemberProps) => m.user.id);
  if (userIds.length === 0) return [];
  try {
    if (level === "project" && workspaceId && projectId) {
      const res = await projectTaskBuilder(
        workspaceId,
        projectId,
        members,
        userIds,
      );
      return res;
    } else {
      return members.map((m: projectBaseMemberProps) => {
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
