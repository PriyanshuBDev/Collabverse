/*
  Warnings:

  - Added the required column `conversationId` to the `MessageDeletion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `conversationId` to the `MessageMedia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `conversationId` to the `MessageMention` table without a default value. This is not possible if the table is not empty.
  - Added the required column `conversationId` to the `MessagePin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `messagePreview` to the `MessagePin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `conversationId` to the `MessageReaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `conversationId` to the `MessageReceipt` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MessageDeletion" ADD COLUMN     "conversationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "MessageMedia" ADD COLUMN     "conversationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "MessageMention" ADD COLUMN     "conversationId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "MessagePin" ADD COLUMN     "conversationId" TEXT NOT NULL,
ADD COLUMN     "deletedFor" TEXT[],
ADD COLUMN     "messagePreview" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "MessageReaction" ADD COLUMN     "conversationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "MessageReceipt" ADD COLUMN     "conversationId" TEXT NOT NULL;
