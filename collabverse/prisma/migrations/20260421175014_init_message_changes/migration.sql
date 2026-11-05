/*
  Warnings:

  - The values [Member] on the enum `ConvMemberStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [Send_Media] on the enum `GroupPerm` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[messageId,mentionedUserId]` on the table `MessageMention` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[messageId,userId]` on the table `MessageReaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `mentionedUserId` to the `MessageMention` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ConvMemberStatus_new" AS ENUM ('Active', 'Kicked', 'Left');
ALTER TABLE "ConversationMember" ALTER COLUMN "status" TYPE "ConvMemberStatus_new" USING ("status"::text::"ConvMemberStatus_new");
ALTER TYPE "ConvMemberStatus" RENAME TO "ConvMemberStatus_old";
ALTER TYPE "ConvMemberStatus_new" RENAME TO "ConvMemberStatus";
DROP TYPE "public"."ConvMemberStatus_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "GroupPerm_new" AS ENUM ('Edit_Group_Details', 'Send_Messages', 'Add_Members', 'Pin', 'Send_Files');
ALTER TABLE "GroupPermission" ALTER COLUMN "permissions" TYPE "GroupPerm_new"[] USING ("permissions"::text::"GroupPerm_new"[]);
ALTER TYPE "GroupPerm" RENAME TO "GroupPerm_old";
ALTER TYPE "GroupPerm_new" RENAME TO "GroupPerm";
DROP TYPE "public"."GroupPerm_old";
COMMIT;

-- DropIndex
DROP INDEX "Message_conversationId_createdAt_idx";

-- DropIndex
DROP INDEX "MessageReaction_messageId_userId_reaction_key";

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "isForwarded" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "workspaceId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "MessageMention" ADD COLUMN     "mentionedUserId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "MessagePin" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "pinnedById" TEXT NOT NULL,
    "pinnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessagePin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MessagePin_messageId_key" ON "MessagePin"("messageId");

-- CreateIndex
CREATE INDEX "Message_conversationId_createdAt_id_idx" ON "Message"("conversationId", "createdAt", "id");

-- CreateIndex
CREATE INDEX "Message_replyToMessageId_idx" ON "Message"("replyToMessageId");

-- CreateIndex
CREATE INDEX "MessageMention_mentionedUserId_seen_idx" ON "MessageMention"("mentionedUserId", "seen");

-- CreateIndex
CREATE UNIQUE INDEX "MessageMention_messageId_mentionedUserId_key" ON "MessageMention"("messageId", "mentionedUserId");

-- CreateIndex
CREATE UNIQUE INDEX "MessageReaction_messageId_userId_key" ON "MessageReaction"("messageId", "userId");

-- CreateIndex
CREATE INDEX "MessageReceipt_messageId_seenAt_idx" ON "MessageReceipt"("messageId", "seenAt");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_workspaceId_fkey" FOREIGN KEY ("senderId", "workspaceId") REFERENCES "WorkspaceMember"("userId", "workspaceId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessagePin" ADD CONSTRAINT "MessagePin_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;
