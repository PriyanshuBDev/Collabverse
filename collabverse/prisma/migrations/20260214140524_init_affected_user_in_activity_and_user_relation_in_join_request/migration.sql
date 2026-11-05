-- DropForeignKey
ALTER TABLE "JoinRequest" DROP CONSTRAINT "JoinRequest_invitationId_fkey";

-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "affectedUserId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastSeenAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Task_workspaceId_status_idx" ON "Task"("workspaceId", "status");

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_affectedUserId_fkey" FOREIGN KEY ("affectedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JoinRequest" ADD CONSTRAINT "JoinRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JoinRequest" ADD CONSTRAINT "JoinRequest_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
