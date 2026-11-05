/*
  Warnings:

  - A unique constraint covering the columns `[workspaceId,dmKey]` on the table `Conversation` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Conversation_dmKey_key";

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_workspaceId_dmKey_key" ON "Conversation"("workspaceId", "dmKey");
