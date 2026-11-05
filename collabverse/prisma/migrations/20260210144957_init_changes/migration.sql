-- DropIndex
DROP INDEX "Activity_projectId_idx";

-- DropIndex
DROP INDEX "Activity_taskId_idx";

-- DropIndex
DROP INDEX "Activity_workspaceId_idx";

-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "completedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Activity_workspaceId_createdAt_id_idx" ON "Activity"("workspaceId", "createdAt", "id");

-- CreateIndex
CREATE INDEX "Activity_projectId_createdAt_id_idx" ON "Activity"("projectId", "createdAt", "id");

-- CreateIndex
CREATE INDEX "Activity_taskId_createdAt_id_idx" ON "Activity"("taskId", "createdAt", "id");
