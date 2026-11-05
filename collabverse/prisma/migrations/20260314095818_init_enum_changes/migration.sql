-- AlterEnum
ALTER TYPE "PPermission" ADD VALUE 'Edit_Project_Details';

-- CreateIndex
CREATE INDEX "Task_workspaceId_lastActivityAt_id_idx" ON "Task"("workspaceId", "lastActivityAt", "id");
