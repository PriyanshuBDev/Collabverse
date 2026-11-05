import { Prisma } from "@prisma/client";

export const workspaceWhere = (
  workspaceId: string,
  search: string | null,
): Prisma.WorkspaceMemberWhereInput => ({
  workspaceId,
  user: search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { username: { contains: search, mode: "insensitive" } },
        ],
      }
    : undefined,
});
export const projectWhere = (
  projectId: string | null,
  workspaceId: string,
  search: string | null,
): Prisma.ProjectMemberWhereInput => ({
  projectId: projectId ?? undefined,
  workspaceMemberWsId: workspaceId,
  workspaceMember: {
    user: search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { username: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined,
  },
});
export const taskWhere = (
  taskId: string | null,
  projectId: string | null,
  workspaceId: string,
  search: string | null,
): Prisma.TaskMemberWhereInput => ({
  projectId: projectId ?? undefined,
  taskId: taskId ?? undefined,
  workspaceId,
  projectMember: {
    workspaceMember: {
      user: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { username: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
    },
  },
});

export const workspaceSelect = () => ({
  user: {
    select: {
      name: true,
      id: true,
      avatar: true,
      username: true,
    },
  },
  joinedAt: true,
  role: true,
});

export const projectSelect = () => ({
  workspaceMember: {
    select: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
        },
      },
    },
  },
  joinedAt: true,
  role: true,
  _count: {
    select: {
      taskMemberShips: true,
    },
  },
});

export const taskSelect = () => ({
  projectMember: {
    select: {
      workspaceMember: {
        select: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            },
          },
        },
      },
    },
  },
  joinedAt: true,
  role: true,
});
