-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_createdById_fkey";

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_createdById_workspaceId_fkey" FOREIGN KEY ("createdById", "workspaceId") REFERENCES "WorkspaceMember"("userId", "workspaceId") ON DELETE RESTRICT ON UPDATE CASCADE;
