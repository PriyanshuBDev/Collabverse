/*
  Warnings:

  - You are about to drop the column `isDeletedForMe` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `repliedToCommentId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `count` on the `CommentReaction` table. All the data in the column will be lost.
  - The primary key for the `ConversationMember` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `count` on the `MessageReaction` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[callSessionId]` on the table `Message` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `replyToCommentId` to the `Comment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CallStatus" AS ENUM ('Ringing', 'Active', 'Ended', 'Missed');

-- CreateEnum
CREATE TYPE "CallType" AS ENUM ('Voice', 'Video');

-- AlterEnum
ALTER TYPE "MessageType" ADD VALUE 'call';

-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_createdById_workspaceId_fkey";

-- DropIndex
DROP INDEX "ConversationMember_conversationId_userId_key";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "isDeletedForMe",
DROP COLUMN "repliedToCommentId",
ADD COLUMN     "replyToCommentId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CommentReaction" DROP COLUMN "count";

-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lastMessageId" TEXT;

-- AlterTable
ALTER TABLE "ConversationMember" DROP CONSTRAINT "ConversationMember_pkey",
ADD COLUMN     "leftAt" TIMESTAMP(3),
ALTER COLUMN "mutedAt" DROP NOT NULL,
ADD CONSTRAINT "ConversationMember_pkey" PRIMARY KEY ("userId", "conversationId");

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "callSessionId" TEXT,
ADD COLUMN     "content" TEXT,
ALTER COLUMN "replyToMessageId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "MessageReaction" DROP COLUMN "count";

-- CreateTable
CREATE TABLE "CommentReceipt" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deliveredAt" TIMESTAMP(3),
    "seenAt" TIMESTAMP(3),

    CONSTRAINT "CommentReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommentDeletion" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommentDeletion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CallSession" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "worksapceId" TEXT NOT NULL,
    "type" "CallType" NOT NULL,
    "status" "CallStatus" NOT NULL,
    "startedById" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "maxParticipants" INTEGER,

    CONSTRAINT "CallSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CallParticipant" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3),
    "leftAt" TIMESTAMP(3),
    "isMuted" BOOLEAN NOT NULL DEFAULT false,
    "isVideoOff" BOOLEAN NOT NULL DEFAULT false,
    "callSessionId" TEXT NOT NULL,

    CONSTRAINT "CallParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CommentReceipt_commentId_userId_key" ON "CommentReceipt"("commentId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "CommentDeletion_commentId_userId_key" ON "CommentDeletion"("commentId", "userId");

-- CreateIndex
CREATE INDEX "CallSession_conversationId_idx" ON "CallSession"("conversationId");

-- CreateIndex
CREATE INDEX "Conversation_workspaceId_lastActivityAt_idx" ON "Conversation"("workspaceId", "lastActivityAt");

-- CreateIndex
CREATE UNIQUE INDEX "Message_callSessionId_key" ON "Message"("callSessionId");

-- CreateIndex
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "MessageReceipt_userId_seenAt_idx" ON "MessageReceipt"("userId", "seenAt");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_replyToCommentId_fkey" FOREIGN KEY ("replyToCommentId") REFERENCES "Comment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentReceipt" ADD CONSTRAINT "CommentReceipt_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentDeletion" ADD CONSTRAINT "CommentDeletion_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallSession" ADD CONSTRAINT "CallSession_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallSession" ADD CONSTRAINT "CallSession_startedById_fkey" FOREIGN KEY ("startedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallParticipant" ADD CONSTRAINT "CallParticipant_callSessionId_fkey" FOREIGN KEY ("callSessionId") REFERENCES "CallSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_replyToMessageId_fkey" FOREIGN KEY ("replyToMessageId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_callSessionId_fkey" FOREIGN KEY ("callSessionId") REFERENCES "CallSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
