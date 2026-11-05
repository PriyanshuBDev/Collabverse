/*
  Warnings:

  - The primary key for the `ProjectMember` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[workspaceMemberUserId,workspaceMemberWsId,projectId]` on the table `ProjectMember` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `ProjectMember` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('Critical', 'High', 'Medium', 'Low');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('To_Do', 'In_Progress', 'In_Review', 'Done');

-- CreateEnum
CREATE TYPE "TaskRole" AS ENUM ('Assignee', 'Reviewer');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "dueDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ProjectMember" DROP CONSTRAINT "ProjectMember_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "priority" "Priority" NOT NULL,
    "status" "TaskStatus" NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskMember" (
    "id" TEXT NOT NULL,
    "projectMemberUserId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "role" "TaskRole" NOT NULL DEFAULT 'Assignee',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Task_projectId_idx" ON "Task"("projectId");

-- CreateIndex
CREATE INDEX "Task_projectId_createdById_idx" ON "Task"("projectId", "createdById");

-- CreateIndex
CREATE INDEX "Task_workspaceId_idx" ON "Task"("workspaceId");

-- CreateIndex
CREATE INDEX "Task_workspaceId_projectId_idx" ON "Task"("workspaceId", "projectId");

-- CreateIndex
CREATE INDEX "Task_status_idx" ON "Task"("status");

-- CreateIndex
CREATE INDEX "Task_projectId_status_idx" ON "Task"("projectId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Task_projectId_slug_key" ON "Task"("projectId", "slug");

-- CreateIndex
CREATE INDEX "TaskMember_taskId_idx" ON "TaskMember"("taskId");

-- CreateIndex
CREATE INDEX "TaskMember_projectMemberUserId_taskId_idx" ON "TaskMember"("projectMemberUserId", "taskId");

-- CreateIndex
CREATE INDEX "TaskMember_taskId_role_idx" ON "TaskMember"("taskId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "TaskMember_projectMemberUserId_taskId_key" ON "TaskMember"("projectMemberUserId", "taskId");

-- CreateIndex
CREATE INDEX "Project_currentOwnerId_idx" ON "Project"("currentOwnerId");

-- CreateIndex
CREATE INDEX "ProjectMember_workspaceMemberWsId_projectId_idx" ON "ProjectMember"("workspaceMemberWsId", "projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMember_workspaceMemberUserId_workspaceMemberWsId_pro_key" ON "ProjectMember"("workspaceMemberUserId", "workspaceMemberWsId", "projectId");

-- CreateIndex
CREATE INDEX "WorkspaceMember_userId_idx" ON "WorkspaceMember"("userId");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "ProjectMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskMember" ADD CONSTRAINT "TaskMember_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskMember" ADD CONSTRAINT "TaskMember_projectMemberUserId_fkey" FOREIGN KEY ("projectMemberUserId") REFERENCES "ProjectMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
