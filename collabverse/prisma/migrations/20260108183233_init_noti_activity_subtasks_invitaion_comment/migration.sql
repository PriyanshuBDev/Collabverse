/*
  Warnings:

  - Added the required column `theme` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "JoinStatus" AS ENUM ('Pending', 'Approved', 'Rejected');

-- CreateEnum
CREATE TYPE "InvitationRole" AS ENUM ('Admin', 'Member', 'Manager', 'Contributor', 'Viewer');

-- CreateEnum
CREATE TYPE "PActivity" AS ENUM ('task_created', 'task_deleted', 'subtask_added', 'subtask_completed', 'subtask_deleted', 'subtask_updated', 'task_member_added', 'task_member_removed', 'task_member_left', 'task_member_role_changed', 'task_mentioned', 'attachment_added', 'task_name_updated', 'task_description_updated', 'task_due_updated', 'task_status_updated', 'task_priority_updated', 'project_created', 'project_deleted', 'project_name_updated', 'project_avatar_updated', 'project_ownership_changed', 'project_description_updated', 'project_due_updated', 'project_member_role_changed', 'project_member_added', 'project_member_removed', 'project_member_left', 'project_mentioned', 'project_settings_updated', 'workspace_created', 'workspace_name_updated', 'workspace_avatar_updated', 'workspace_description_updated', 'workspace_ownership_changed', 'workspace_settings_updated', 'workspace_member_added', 'workspace_member_removed', 'workspace_member_role_changed', 'workspace_member_left', 'other');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('invited_to_workspace', 'workspace_invite_accepted', 'workspace_invite_declined', 'removed_from_workspace', 'workspace_role_changed', 'workspace_owner_transferred', 'workspace_deleted', 'invited_to_project', 'project_invite_accepted', 'project_due_date_changed', 'removed_from_project', 'project_role_change', 'project_deleted', 'task_assigned', 'task_unassigned', 'task_due_date_changed', 'task_completed', 'task_deleted', 'mentioned_in_task', 'mentioned_in_project', 'password_changed', 'new_device_login', 'system_announcement', 'maintenance_scheduled', 'maintenance_completed', 'new_message', 'missed_voice_call', 'missed_video_call', 'missed_calls', 'other');

-- CreateEnum
CREATE TYPE "Theme" AS ENUM ('Dark', 'Light', 'Default');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "mute" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "theme" "Theme" NOT NULL,
ADD COLUMN     "twoFA" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Subtask" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL,
    "description" TEXT,
    "createdById" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,

    CONSTRAINT "Subtask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "format" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "attachedById" TEXT NOT NULL,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pinIdx" INTEGER,
    "sentAt" TIMESTAMP(3),
    "isDeletedForMe" BOOLEAN NOT NULL,
    "isDeleted" BOOLEAN NOT NULL,
    "readBy" TEXT[],
    "taskMemberId" TEXT,
    "projectMemberId" TEXT,
    "projectId" TEXT,
    "taskId" TEXT,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommentReaction" (
    "id" TEXT NOT NULL,
    "reaction" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "taskMemberId" TEXT,
    "projectMemberId" TEXT,

    CONSTRAINT "CommentReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommentMention" (
    "id" TEXT NOT NULL,
    "taskMemberId" TEXT,
    "projectMemberId" TEXT,
    "commentId" TEXT NOT NULL,
    "seen" BOOLEAN NOT NULL,

    CONSTRAINT "CommentMention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommentReply" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,

    CONSTRAINT "CommentReply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "type" "PActivity" NOT NULL DEFAULT 'other',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "target" JSONB,
    "meta" JSONB,
    "workspaceId" TEXT,
    "projectId" TEXT,
    "taskId" TEXT NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "target" JSONB,
    "routeTo" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3) NOT NULL,
    "workspaceId" TEXT,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "expireAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT,
    "workspaceId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "role" "InvitationRole" NOT NULL,
    "token" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JoinRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "projectId" TEXT,
    "role" "InvitationRole" NOT NULL,
    "status" "JoinStatus" NOT NULL,
    "invitationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JoinRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Subtask_taskId_idx" ON "Subtask"("taskId");

-- CreateIndex
CREATE INDEX "Comment_projectId_idx" ON "Comment"("projectId");

-- CreateIndex
CREATE INDEX "Comment_taskId_idx" ON "Comment"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "CommentReply_commentId_key" ON "CommentReply"("commentId");

-- CreateIndex
CREATE INDEX "Activity_workspaceId_idx" ON "Activity"("workspaceId");

-- CreateIndex
CREATE INDEX "Activity_projectId_idx" ON "Activity"("projectId");

-- CreateIndex
CREATE INDEX "Activity_taskId_idx" ON "Activity"("taskId");

-- CreateIndex
CREATE INDEX "Activity_type_idx" ON "Activity"("type");

-- CreateIndex
CREATE INDEX "Notification_workspaceId_idx" ON "Notification"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "JoinRequest_userId_invitationId_key" ON "JoinRequest"("userId", "invitationId");

-- AddForeignKey
ALTER TABLE "Subtask" ADD CONSTRAINT "Subtask_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "TaskMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subtask" ADD CONSTRAINT "Subtask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_attachedById_fkey" FOREIGN KEY ("attachedById") REFERENCES "TaskMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_taskMemberId_fkey" FOREIGN KEY ("taskMemberId") REFERENCES "TaskMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_projectMemberId_fkey" FOREIGN KEY ("projectMemberId") REFERENCES "ProjectMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentReaction" ADD CONSTRAINT "CommentReaction_taskMemberId_fkey" FOREIGN KEY ("taskMemberId") REFERENCES "TaskMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentReaction" ADD CONSTRAINT "CommentReaction_projectMemberId_fkey" FOREIGN KEY ("projectMemberId") REFERENCES "ProjectMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentMention" ADD CONSTRAINT "CommentMention_taskMemberId_fkey" FOREIGN KEY ("taskMemberId") REFERENCES "TaskMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentMention" ADD CONSTRAINT "CommentMention_projectMemberId_fkey" FOREIGN KEY ("projectMemberId") REFERENCES "ProjectMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentMention" ADD CONSTRAINT "CommentMention_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentReply" ADD CONSTRAINT "CommentReply_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JoinRequest" ADD CONSTRAINT "JoinRequest_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
