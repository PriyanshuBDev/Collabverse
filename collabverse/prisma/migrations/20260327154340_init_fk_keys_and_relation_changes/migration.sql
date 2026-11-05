/*
  Warnings:

  - You are about to drop the column `projectMemberId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `taskMemberId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `projectMemberId` on the `CommentMention` table. All the data in the column will be lost.
  - You are about to drop the column `taskMemberId` on the `CommentMention` table. All the data in the column will be lost.
  - You are about to drop the column `projectMemberId` on the `CommentReaction` table. All the data in the column will be lost.
  - You are about to drop the column `taskMemberId` on the `CommentReaction` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[reaction,commentId]` on the table `CommentReaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `workspaceId` to the `Subtask` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Attachment" DROP CONSTRAINT "Attachment_attachedById_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_projectMemberId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_replyToCommentId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_taskMemberId_fkey";

-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_senderId_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_currentOwnerId_fkey";

-- DropForeignKey
ALTER TABLE "Subtask" DROP CONSTRAINT "Subtask_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_createdById_workspaceId_fkey";

-- DropIndex
DROP INDEX "CommentReaction_reaction_taskMemberId_projectMemberId_comme_key";

-- AlterTable
ALTER TABLE "Attachment" ALTER COLUMN "attachedById" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "projectMemberId",
DROP COLUMN "taskMemberId",
ADD COLUMN     "commentedById" TEXT,
ALTER COLUMN "isDeleted" SET DEFAULT false,
ALTER COLUMN "replyToCommentId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "CommentMention" DROP COLUMN "projectMemberId",
DROP COLUMN "taskMemberId",
ADD COLUMN     "mentionedUserId" TEXT;

-- AlterTable
ALTER TABLE "CommentReaction" DROP COLUMN "projectMemberId",
DROP COLUMN "taskMemberId",
ADD COLUMN     "reactedById" TEXT;

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "senderId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Subtask" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "markedById" TEXT,
ADD COLUMN     "workspaceId" TEXT NOT NULL,
ALTER COLUMN "createdById" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "createdById" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CommentReaction_reaction_commentId_key" ON "CommentReaction"("reaction", "commentId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_currentOwnerId_workspaceId_fkey" FOREIGN KEY ("currentOwnerId", "workspaceId") REFERENCES "WorkspaceMember"("userId", "workspaceId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_replyToCommentId_fkey" FOREIGN KEY ("replyToCommentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
