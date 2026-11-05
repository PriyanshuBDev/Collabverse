-- CreateEnum
CREATE TYPE "WsRole" AS ENUM ('Admin', 'Member');

-- CreateEnum
CREATE TYPE "WsPermission" AS ENUM ('Invite', 'Create_Project', 'Approve_Join', 'Remove_Member', 'Edit_Ws_Details');

-- CreateEnum
CREATE TYPE "PPermission" AS ENUM ('Comment', 'Invite', 'Remove_Member');

-- CreateEnum
CREATE TYPE "PRole" AS ENUM ('Manager', 'Contributor', 'Viewer');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "avatar" TEXT,
    "username" TEXT NOT NULL,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "avatar" TEXT,
    "description" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "currentOwnerId" TEXT NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceRole" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "role" "WsRole" NOT NULL,
    "permissions" "WsPermission"[],

    CONSTRAINT "WorkspaceRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceMember" (
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "role" "WsRole" NOT NULL DEFAULT 'Member',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkspaceMember_pkey" PRIMARY KEY ("userId","workspaceId")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    "currentOwnerId" TEXT NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectMember" (
    "workspaceMemberUserId" TEXT NOT NULL,
    "workspaceMemberWsId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "role" "PRole" NOT NULL DEFAULT 'Viewer',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("workspaceMemberUserId","workspaceMemberWsId","projectId")
);

-- CreateTable
CREATE TABLE "ProjectRole" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "role" "PRole" NOT NULL,
    "permissions" "PPermission"[],

    CONSTRAINT "ProjectRole_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_slug_key" ON "Workspace"("slug");

-- CreateIndex
CREATE INDEX "WorkspaceRole_workspaceId_idx" ON "WorkspaceRole"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceRole_workspaceId_role_key" ON "WorkspaceRole"("workspaceId", "role");

-- CreateIndex
CREATE INDEX "WorkspaceMember_workspaceId_idx" ON "WorkspaceMember"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "Project_workspaceId_idx" ON "Project"("workspaceId");

-- CreateIndex
CREATE INDEX "ProjectMember_projectId_idx" ON "ProjectMember"("projectId");

-- CreateIndex
CREATE INDEX "ProjectMember_workspaceMemberUserId_workspaceMemberWsId_idx" ON "ProjectMember"("workspaceMemberUserId", "workspaceMemberWsId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectRole_projectId_role_key" ON "ProjectRole"("projectId", "role");

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_currentOwnerId_fkey" FOREIGN KEY ("currentOwnerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceRole" ADD CONSTRAINT "WorkspaceRole_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_currentOwnerId_fkey" FOREIGN KEY ("currentOwnerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_workspaceMemberUserId_workspaceMemberWsId_fkey" FOREIGN KEY ("workspaceMemberUserId", "workspaceMemberWsId") REFERENCES "WorkspaceMember"("userId", "workspaceId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectRole" ADD CONSTRAINT "ProjectRole_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
