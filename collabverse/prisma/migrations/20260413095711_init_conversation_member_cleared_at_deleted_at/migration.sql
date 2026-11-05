-- AlterTable
ALTER TABLE "ConversationMember" ADD COLUMN     "clearedAt" TIMESTAMP(3),
ADD COLUMN     "deletedAt" TIMESTAMP(3);
