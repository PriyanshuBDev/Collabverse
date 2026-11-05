/*
  Warnings:

  - You are about to drop the column `activeConversationId` on the `ConversationMember` table. All the data in the column will be lost.
  - You are about to drop the column `activeConvoExpiresAt` on the `ConversationMember` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ConversationMember" DROP COLUMN "activeConversationId",
DROP COLUMN "activeConvoExpiresAt";

-- AlterTable
ALTER TABLE "WorkspaceMember" ADD COLUMN     "activeConversationId" TEXT,
ADD COLUMN     "activeConvoExpiresAt" TIMESTAMP(3);
