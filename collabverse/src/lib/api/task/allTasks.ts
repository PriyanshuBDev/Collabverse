"use server";

import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
type TaskMemberWithTask = Prisma.TaskMemberGetPayload<{
  include: {
    task: {
      include: {
        project: true;
      };
    };
  };
}>;
export default async function allTasks(
  workspaceId: string,
  userId: string,
  projectId?: string,
) {
  const taskMemberships: TaskMemberWithTask[] =
    await prisma.taskMember.findMany({
      where: projectId
        ? {
            projectMember: {
              projectId,
              workspaceMember: {
                userId,
                workspaceId,
              },
            },
          }
        : {
            projectMember: {
              workspaceMember: {
                userId,
                workspaceId,
              },
            },
          },
      include: {
        task: {
          include: {
            project: true,
          },
        },
      },
    });
  return taskMemberships.map((tm: TaskMemberWithTask) => tm.task);
}
