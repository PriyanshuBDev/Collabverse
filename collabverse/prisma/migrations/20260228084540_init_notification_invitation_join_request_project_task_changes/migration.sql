/*
  Warnings:

  - The values [workspace_invite_accepted,workspace_invite_declined,project_invite_accepted] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `isActive` on the `Invitation` table. All the data in the column will be lost.
  - You are about to drop the column `token` on the `Invitation` table. All the data in the column will be lost.
  - You are about to drop the column `projectId` on the `JoinRequest` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tokenHash]` on the table `Invitation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('Pending', 'Accepted', 'Rejected', 'Revoked');

-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('invited_to_workspace', 'workspace_join_accepted', 'workspace_join_declined', 'removed_from_workspace', 'workspace_role_changed', 'workspace_owner_transferred_from_you', 'workspace_owner_transferred_to_you', 'workspace_owner_transferred', 'workspace_deleted', 'workspace_left', 'invited_to_project', 'project_due_date_changed', 'removed_from_project', 'project_role_change', 'project_deleted', 'task_assigned', 'task_unassigned', 'task_due_date_changed', 'task_completed', 'task_deleted', 'task_role_changed', 'mentioned_in_task', 'mentioned_in_project', 'password_changed', 'new_device_login', 'system_announcement', 'maintenance_scheduled', 'maintenance_completed', 'new_message_dm', 'new_message_group', 'kicked_group', 'missed_voice_call', 'missed_video_call', 'missed_calls', 'other');
ALTER TABLE "Notification" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "public"."NotificationType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Invitation" DROP COLUMN "isActive",
DROP COLUMN "token",
ADD COLUMN     "invitedUserId" TEXT,
ADD COLUMN     "requireApproval" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "status" "InvitationStatus" NOT NULL DEFAULT 'Pending',
ADD COLUMN     "tokenHash" TEXT,
ALTER COLUMN "expireAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "JoinRequest" DROP COLUMN "projectId",
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedById" TEXT,
ALTER COLUMN "status" SET DEFAULT 'Pending';

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "senderId" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_tokenHash_key" ON "Invitation"("tokenHash");

-- CreateIndex
CREATE INDEX "Invitation_workspaceId_idx" ON "Invitation"("workspaceId");

-- CreateIndex
CREATE INDEX "JoinRequest_status_idx" ON "JoinRequest"("status");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_invitedUserId_fkey" FOREIGN KEY ("invitedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JoinRequest" ADD CONSTRAINT "JoinRequest_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
