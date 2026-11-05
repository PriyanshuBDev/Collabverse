-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'workspace_owner_transferred_from_you';
ALTER TYPE "NotificationType" ADD VALUE 'workspace_owner_transferred_to_you';
ALTER TYPE "NotificationType" ADD VALUE 'task_role_changed';

-- CreateIndex
CREATE INDEX "TaskMember_projectMemberUserId_workspaceId_projectId_taskId_idx" ON "TaskMember"("projectMemberUserId", "workspaceId", "projectId", "taskId");
