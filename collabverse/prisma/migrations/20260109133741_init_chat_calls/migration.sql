/*
  Warnings:

  - The values [new_message] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `CommentReply` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[reaction,taskMemberId,projectMemberId,commentId]` on the table `CommentReaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `repliedToCommentId` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `commentId` to the `CommentReaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ConvMemberStatus" AS ENUM ('Member', 'Kicked', 'Left');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('text', 'media', 'system');

-- CreateEnum
CREATE TYPE "GroupRole" AS ENUM ('Admin', 'Member');

-- CreateEnum
CREATE TYPE "MuteEnum" AS ENUM ('eight', 'week', 'always');

-- CreateEnum
CREATE TYPE "ChatListType" AS ENUM ('Group', 'Dm');

-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('invited_to_workspace', 'workspace_invite_accepted', 'workspace_invite_declined', 'removed_from_workspace', 'workspace_role_changed', 'workspace_owner_transferred', 'workspace_deleted', 'invited_to_project', 'project_invite_accepted', 'project_due_date_changed', 'removed_from_project', 'project_role_change', 'project_deleted', 'task_assigned', 'task_unassigned', 'task_due_date_changed', 'task_completed', 'task_deleted', 'mentioned_in_task', 'mentioned_in_project', 'password_changed', 'new_device_login', 'system_announcement', 'maintenance_scheduled', 'maintenance_completed', 'new_message_dm', 'new_message_group', 'kicked_group', 'missed_voice_call', 'missed_video_call', 'missed_calls', 'other');
ALTER TABLE "Notification" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "public"."NotificationType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "CommentMention" DROP CONSTRAINT "CommentMention_projectMemberId_fkey";

-- DropForeignKey
ALTER TABLE "CommentMention" DROP CONSTRAINT "CommentMention_taskMemberId_fkey";

-- DropForeignKey
ALTER TABLE "CommentReaction" DROP CONSTRAINT "CommentReaction_projectMemberId_fkey";

-- DropForeignKey
ALTER TABLE "CommentReaction" DROP CONSTRAINT "CommentReaction_taskMemberId_fkey";

-- DropForeignKey
ALTER TABLE "CommentReply" DROP CONSTRAINT "CommentReply_commentId_fkey";

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "repliedToCommentId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CommentMention" ALTER COLUMN "seen" SET DEFAULT false;

-- AlterTable
ALTER TABLE "CommentReaction" ADD COLUMN     "commentId" TEXT NOT NULL;

-- DropTable
DROP TABLE "CommentReply";

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "type" "ChatListType" NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "avatar" TEXT,
    "createdById" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupPermission" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "editGroupSettings" BOOLEAN NOT NULL DEFAULT false,
    "sendMessages" BOOLEAN NOT NULL DEFAULT true,
    "addMembers" BOOLEAN NOT NULL DEFAULT false,
    "pin" BOOLEAN NOT NULL DEFAULT true,
    "sendMedia" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "GroupPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationMember" (
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" "GroupRole" DEFAULT 'Member',
    "mutedFor" "MuteEnum",
    "pinIndex" INTEGER,
    "mutedAt" TIMESTAMP(3) NOT NULL,
    "lastReadMessageId" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ConvMemberStatus" NOT NULL,

    CONSTRAINT "ConversationMember_pkey" PRIMARY KEY ("userId","workspaceId")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "type" "MessageType" NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editedAt" TIMESTAMP(3),
    "replyToMessageId" TEXT NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageMedia" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "bytes" INTEGER NOT NULL,
    "messageId" TEXT NOT NULL,

    CONSTRAINT "MessageMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageReaction" (
    "id" TEXT NOT NULL,
    "reaction" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,

    CONSTRAINT "MessageReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageMention" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "seen" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MessageMention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageReceipt" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deliveredAt" TIMESTAMP(3),
    "seenAt" TIMESTAMP(3),

    CONSTRAINT "MessageReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageDeletion" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageDeletion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Conversation_type_idx" ON "Conversation"("type");

-- CreateIndex
CREATE UNIQUE INDEX "GroupPermission_conversationId_key" ON "GroupPermission"("conversationId");

-- CreateIndex
CREATE INDEX "ConversationMember_userId_idx" ON "ConversationMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationMember_conversationId_userId_key" ON "ConversationMember"("conversationId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "MessageReaction_messageId_userId_reaction_key" ON "MessageReaction"("messageId", "userId", "reaction");

-- CreateIndex
CREATE UNIQUE INDEX "MessageReceipt_messageId_userId_key" ON "MessageReceipt"("messageId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "MessageDeletion_messageId_userId_key" ON "MessageDeletion"("messageId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "CommentReaction_reaction_taskMemberId_projectMemberId_comme_key" ON "CommentReaction"("reaction", "taskMemberId", "projectMemberId", "commentId");

-- AddForeignKey
ALTER TABLE "CommentReaction" ADD CONSTRAINT "CommentReaction_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_createdById_workspaceId_fkey" FOREIGN KEY ("createdById", "workspaceId") REFERENCES "WorkspaceMember"("userId", "workspaceId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupPermission" ADD CONSTRAINT "GroupPermission_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationMember" ADD CONSTRAINT "ConversationMember_userId_workspaceId_fkey" FOREIGN KEY ("userId", "workspaceId") REFERENCES "WorkspaceMember"("userId", "workspaceId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationMember" ADD CONSTRAINT "ConversationMember_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_workspaceId_fkey" FOREIGN KEY ("senderId", "workspaceId") REFERENCES "WorkspaceMember"("userId", "workspaceId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageMedia" ADD CONSTRAINT "MessageMedia_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageReaction" ADD CONSTRAINT "MessageReaction_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageMention" ADD CONSTRAINT "MessageMention_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageReceipt" ADD CONSTRAINT "MessageReceipt_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageDeletion" ADD CONSTRAINT "MessageDeletion_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;
