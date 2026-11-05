/*
  Warnings:

  - Added the required column `projectId` to the `TaskMember` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspaceId` to the `TaskMember` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TaskMember" DROP CONSTRAINT "TaskMember_projectMemberUserId_fkey";

-- AlterTable
ALTER TABLE "TaskMember" ADD COLUMN     "projectId" TEXT NOT NULL,
ADD COLUMN     "workspaceId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "TaskMember_projectMemberUserId_workspaceId_projectId_idx" ON "TaskMember"("projectMemberUserId", "workspaceId", "projectId");

-- AddForeignKey
ALTER TABLE "TaskMember" ADD CONSTRAINT "TaskMember_projectMemberUserId_workspaceId_projectId_fkey" FOREIGN KEY ("projectMemberUserId", "workspaceId", "projectId") REFERENCES "ProjectMember"("workspaceMemberUserId", "workspaceMemberWsId", "projectId") ON DELETE CASCADE ON UPDATE CASCADE;
