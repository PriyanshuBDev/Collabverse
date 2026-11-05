import { Prisma } from "@prisma/client";

export const getWorkspaceOffsetPagination = (
  pageNumber: number,
  pageSize: number,
): Prisma.WorkspaceMemberFindManyArgs => ({
  skip: (pageNumber - 1) * pageSize,
  take: pageSize,
  orderBy: [{ user: { name: "asc" } }, { user: { id: "asc" } }],
});

export const getProjectOffsetPagination = (
  pageNumber: number,
  pageSize: number,
): Prisma.ProjectMemberFindManyArgs => ({
  skip: (pageNumber - 1) * pageSize,
  take: pageSize,
  orderBy: [
    { workspaceMember: { user: { name: "asc" } } },
    { workspaceMember: { user: { id: "asc" } } },
  ],
});

export const getTaskOffsetPagination = (
  pageNumber: number,
  pageSize: number,
): Prisma.TaskMemberFindManyArgs => ({
  skip: (pageNumber - 1) * pageSize,
  take: pageSize,
  orderBy: [
    { projectMember: { workspaceMember: { user: { name: "asc" } } } },
    { projectMember: { workspaceMember: { user: { id: "asc" } } } },
  ],
});

export const getWorkspaceCursorPagination = (
  cursorId: string | null,
  pageSize: number,
  workspaceId: string,
) => ({
  take: pageSize + 1,
  skip: cursorId ? 1 : 0,
  cursor: cursorId
    ? {
        userId_workspaceId: {
          userId: cursorId,
          workspaceId,
        },
      }
    : undefined,
  orderBy: [
    {
      role: "asc",
    },
    { userId: "asc" },
  ] as Prisma.WorkspaceMemberOrderByWithRelationInput,
});

export const getProjectCursorPagination = (
  cursorId: string | null,
  pageSize: number,
  workspaceId: string,
  projectId: string,
) => ({
  take: pageSize + 1,
  cursor: cursorId
    ? {
        workspaceMemberUserId_workspaceMemberWsId_projectId: {
          workspaceMemberUserId: cursorId,
          workspaceMemberWsId: workspaceId,
          projectId,
        },
      }
    : undefined,
  skip: cursorId ? 1 : 0,
  orderBy: [
    { role: "asc" },
    {
      workspaceMember: {
        userId: "asc",
      },
    },
  ] as Prisma.ProjectMemberOrderByWithRelationInput,
});

export const getTaskCursorPagination = (
  cursorId: string | null,
  pageSize: number,
  workspaceId: string,
  projectId: string,
  taskId: string,
) => ({
  take: pageSize + 1,
  cursor: cursorId
    ? {
        projectMemberUserId_taskId: {
          projectMemberUserId: cursorId,
          taskId,
        },
        projectId,
        workspaceId,
      }
    : undefined,
  skip: cursorId ? 1 : 0,
  orderBy: [
    { role: "asc" },
    {
      projectMember: {
        workspaceMember: {
          userId: "asc",
        },
      },
    },
  ] as Prisma.TaskMemberOrderByWithRelationInput,
});
