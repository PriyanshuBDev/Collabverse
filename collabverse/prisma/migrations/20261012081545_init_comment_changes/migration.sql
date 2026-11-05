/*
  Warnings:

  - You are about to drop the column `pinIdx` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `projectId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `readBy` on the `Comment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[commentId,reactedById]` on the table `CommentReaction` will be added. If there are existing duplicate values, this will fail.
  - Made the column `sentAt` on table `Comment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `taskId` on table `Comment` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `taskId` to the `CommentDeletion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taskId` to the `CommentMention` table without a default value. This is not possible if the table is not empty.
  - Made the column `mentionedUserId` on table `CommentMention` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `taskId` to the `CommentReaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taskId` to the `CommentReceipt` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_projectId_fkey";

-- DropIndex
DROP INDEX "Comment_projectId_idx";

-- DropIndex
DROP INDEX "CommentReaction_reaction_commentId_key";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "pinIdx",
DROP COLUMN "projectId",
DROP COLUMN "readBy",
ALTER COLUMN "createdAt" DROP DEFAULT,
ALTER COLUMN "sentAt" SET NOT NULL,
ALTER COLUMN "sentAt" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "taskId" SET NOT NULL;

-- AlterTable
ALTER TABLE "CommentDeletion" ADD COLUMN     "taskId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CommentMention" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "taskId" TEXT NOT NULL,
ALTER COLUMN "mentionedUserId" SET NOT NULL;

-- AlterTable
ALTER TABLE "CommentReaction" ADD COLUMN     "taskId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CommentReceipt" ADD COLUMN     "taskId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Comment_taskId_sentAt_id_idx" ON "Comment"("taskId", "sentAt", "id");

-- CreateIndex
CREATE INDEX "Comment_replyToCommentId_idx" ON "Comment"("replyToCommentId");

-- CreateIndex
CREATE UNIQUE INDEX "CommentReaction_commentId_reactedById_key" ON "CommentReaction"("commentId", "reactedById");

-- CreateIndex
CREATE INDEX "CommentReceipt_userId_seenAt_idx" ON "CommentReceipt"("userId", "seenAt");

-- CreateIndex
CREATE INDEX "CommentReceipt_commentId_seenAt_idx" ON "CommentReceipt"("commentId", "seenAt");
