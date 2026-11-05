-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_actorUserId_fkey";

-- DropForeignKey
ALTER TABLE "CallSession" DROP CONSTRAINT "CallSession_startedById_fkey";

-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Invitation" DROP CONSTRAINT "Invitation_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_currentOwnerId_fkey";

-- DropForeignKey
ALTER TABLE "Workspace" DROP CONSTRAINT "Workspace_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Workspace" DROP CONSTRAINT "Workspace_currentOwnerId_fkey";

-- AlterTable
ALTER TABLE "Activity" ALTER COLUMN "actorUserId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "CallSession" ALTER COLUMN "startedById" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Conversation" ALTER COLUMN "createdById" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Invitation" ALTER COLUMN "createdById" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "createdById" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Workspace" ALTER COLUMN "createdById" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_currentOwnerId_fkey" FOREIGN KEY ("currentOwnerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_currentOwnerId_fkey" FOREIGN KEY ("currentOwnerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallSession" ADD CONSTRAINT "CallSession_startedById_fkey" FOREIGN KEY ("startedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
