/*
  Warnings:

  - The values [attachment_added] on the enum `ActivityType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ActivityType_new" AS ENUM ('task_created', 'task_deleted', 'subtask_added', 'subtask_completed', 'subtask_unmarked', 'subtask_deleted', 'subtask_updated', 'task_member_added', 'task_member_removed', 'task_member_left', 'task_member_role_changed', 'task_mentioned', 'task_attachment_added', 'task_name_updated', 'task_description_updated', 'task_due_updated', 'task_status_updated', 'task_priority_updated', 'project_created', 'project_deleted', 'project_name_updated', 'project_avatar_updated', 'project_ownership_changed', 'project_description_updated', 'project_due_updated', 'project_member_role_changed', 'project_member_added', 'project_member_removed', 'project_member_left', 'project_mentioned', 'project_settings_updated', 'workspace_created', 'workspace_name_updated', 'workspace_avatar_updated', 'workspace_description_updated', 'workspace_ownership_changed', 'workspace_settings_updated', 'workspace_member_added', 'workspace_member_removed', 'workspace_member_role_changed', 'workspace_member_left', 'other');
ALTER TABLE "public"."Activity" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Activity" ALTER COLUMN "type" TYPE "ActivityType_new" USING ("type"::text::"ActivityType_new");
ALTER TYPE "ActivityType" RENAME TO "ActivityType_old";
ALTER TYPE "ActivityType_new" RENAME TO "ActivityType";
DROP TYPE "public"."ActivityType_old";
ALTER TABLE "Activity" ALTER COLUMN "type" SET DEFAULT 'other';
COMMIT;

-- AlterTable
ALTER TABLE "Attachment" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
