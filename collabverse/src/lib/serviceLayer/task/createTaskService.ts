import { taskCreateUsersProps } from "@/app/interfaces";
import { prisma } from "@/lib/db/prisma";
import { task_assigned_notifiation } from "@/lib/functions/notifications/notifications";
import { generateSlug } from "@/lib/functions/workspace/generateSlug";
import { $Enums, Priority, Prisma, TaskStatus } from "@prisma/client";

const MAX_RETRIES = 5;
type wsRoleId = {
  role: $Enums.PRole;
  workspaceMemberUserId: string;
};
export async function createTaskService(
  userId: string,
  workspaceId: string,
  projectId: string,
  name: string,
  status: TaskStatus,
  priority: Priority,
  dueDate: Date,
  description?: string,
  users?: taskCreateUsersProps[],
) {
  const firstTask = await prisma.task.findFirst({
    where: {
      projectId,
      status,
    },
    orderBy: {
      position: "asc",
    },
    select: {
      position: true,
    },
  });

  const userIds = users?.map((u) => u.id) ?? [];
  let filteredUsers: taskCreateUsersProps[] = [];
  if (users && users.length > 0) {
    const projectMembers = await prisma.projectMember.findMany({
      where: {
        workspaceMemberUserId: {
          in: userIds,
        },
        workspaceMemberWsId: workspaceId,
        projectId,
      },
      select: {
        workspaceMemberUserId: true,
        role: true,
      },
    });

    const validIds = projectMembers
      .filter((p: wsRoleId) => p.role !== "Viewer")
      .map((p: wsRoleId) => p.workspaceMemberUserId);
    const invalidIds = userIds.filter((u: string) => !validIds.includes(u));
    if (userIds.length === invalidIds.length) {
      throw new Error("You can only assign project users (except viewer)");
    }
    filteredUsers = users.filter((u: taskCreateUsersProps) =>
      validIds.includes(u.id),
    );
  }
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const slug = generateSlug(name);
    try {
      const res = await prisma.task.create({
        data: {
          name,
          slug,
          status,
          priority,
          description,
          dueDate,
          position: firstTask ? firstTask.position - 1000 : 1000,
          createdById: userId,
          workspaceId,
          projectId,
          ...(filteredUsers.length > 0 && {
            members: {
              createMany: {
                data: filteredUsers.map((u: taskCreateUsersProps) => ({
                  projectId,
                  projectMemberUserId: u.id,
                  role: u.role,
                  workspaceId,
                })),
              },
            },
          }),
          activities: {
            create: {
              workspaceId,
              projectId,
              type: "task_created",
              actorUserId: userId,
              target: {
                name,
              },
            },
          },
        },
        select: {
          id: true,
          slug: true,
          name: true,
          project: {
            select: {
              slug: true,
              name: true,
            },
          },
        },
      });
      if (filteredUsers.length > 0) {
        await task_assigned_notifiation(
          filteredUsers,
          userId,
          workspaceId,
          res.id,
          res.name,
          res.slug,
          res.project.name,
          res.project.slug,
        );
      }

      return { slug: res.slug, id: res.id };
    } catch (e: unknown) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        continue;
      }
      throw e;
    }
  }
  throw new Error("Failed to generate unique project slug");
}
