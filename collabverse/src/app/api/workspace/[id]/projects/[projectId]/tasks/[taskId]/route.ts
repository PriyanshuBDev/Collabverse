import { basicMember, subTaskProps, taskProps } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom } from "@/lib/functions/error/apiError";
import { taskAuthority } from "@/lib/serviceLayer/task/taskAuthority";
import { User } from "@supabase/supabase-js";
type resSubtaskProp = {
  id: string;
  name: string;
  createdAt: Date;
  description: string | null;
  createdById: string | null;
  done: boolean;
  markedById: string | null;
};
type userProp = {
  user: {
    id: string;
    name: string | null;
    avatar: string | null;
  };
};
export const GET = withAuth(
  async (
    user: User,
    req: Request,
    { params: paramsPromise }: { params: Promise<{ id: string; projectId: string; taskId: string }> },
  ) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    const projectId = params.projectId;
    const taskId = params.taskId;
    if (!workspaceId || !projectId || !taskId) {
      return apiErrorCustom("Invalid parameters");
    }
    try {
      const access = await taskAuthority(
        user.id,
        workspaceId,
        projectId,
        taskId,
      );
      if (!access.success) {
        return apiErrorCustom("You are not authorised");
      }
      const res = await prisma.task.findFirst({
        where: {
          id: taskId,
          workspaceId,
          projectId,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          priority: true,
          description: true,
          dueDate: true,
          createdAt: true,
          subtasks: {
            orderBy: {
              createdAt: "desc",
            },
            select: {
              id: true,
              name: true,
              done: true,
              description: true,
              createdAt: true,
              createdById: true,
              markedById: true,
            },
          },
          createdById: true,
          _count: {
            select: {
              members: true,
            },
          },
        },
      });
      if (!res) {
        return apiErrorCustom("Task not found");
      }
      const userMap = new Map<string, basicMember>();
      const userIds = new Set<string>();
      res.subtasks.forEach((s: resSubtaskProp) => {
        if (s.createdById) userIds.add(s.createdById);
        if (s.markedById) userIds.add(s.markedById);
      });
      if (res.createdById) userIds.add(res.createdById);
      if (userIds.size > 0) {
        const users = await prisma.workspaceMember.findMany({
          where: {
            userId: {
              in: [...userIds],
            },
            workspaceId,
          },
          select: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        });
        users.forEach((c: userProp) => {
          const user = c.user;
          userMap.set(user.id, {
            id: user.id,
            name: user.name ?? "unknown",
            avatar: user.avatar ?? undefined,
          });
        });
      }
      const defaultUser = {
        id: undefined,
        name: "Former member",
        avatar: "/assets/anonymous.webp",
      };
      const subtasks: subTaskProps[] = res.subtasks.map((s: resSubtaskProp) => {
        const markedBy = s.done
          ? s.markedById
            ? (userMap.get(s.markedById) ?? defaultUser)
            : defaultUser
          : undefined;

        const createdBy = s.createdById
          ? (userMap.get(s.createdById) ?? defaultUser)
          : defaultUser;

        return {
          ...s,
          description: s.description ?? undefined,
          markedBy,
          createdBy,
        };
      });
      const task: taskProps = {
        ...res,
        description: res.description ?? undefined,
        due: res.dueDate,
        subtasks,
        createdBy: res.createdById
          ? (userMap.get(res.createdById) ?? defaultUser)
          : defaultUser,
        totalMembers: res._count.members,
      };
      return Response.json({ task }, { status: 200 });
    } catch {
      return apiErrorCustom("Something went wrong");
    }
  },
);
