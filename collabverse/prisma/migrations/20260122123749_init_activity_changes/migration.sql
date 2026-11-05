/*
  Warnings:

  - The `type` column on the `Activity` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('task_created', 'task_deleted', 'subtask_added', 'subtask_completed', 'subtask_deleted', 'subtask_updated', 'task_member_added', 'task_member_removed', 'task_member_left', 'task_member_role_changed', 'task_mentioned', 'attachment_added', 'task_name_updated', 'task_description_updated', 'task_due_updated', 'task_status_updated', 'task_priority_updated', 'project_created', 'project_deleted', 'project_name_updated', 'project_avatar_updated', 'project_ownership_changed', 'project_description_updated', 'project_due_updated', 'project_member_role_changed', 'project_member_added', 'project_member_removed', 'project_member_left', 'project_mentioned', 'project_settings_updated', 'workspace_created', 'workspace_name_updated', 'workspace_avatar_updated', 'workspace_description_updated', 'workspace_ownership_changed', 'workspace_settings_updated', 'workspace_member_added', 'workspace_member_removed', 'workspace_member_role_changed', 'workspace_member_left', 'other');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'workspace_left';

-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "type",
ADD COLUMN     "type" "ActivityType" NOT NULL DEFAULT 'other';

-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "readAt" DROP NOT NULL;

-- DropEnum
DROP TYPE "PActivity";

-- CreateIndex
CREATE INDEX "Activity_type_idx" ON "Activity"("type");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");
