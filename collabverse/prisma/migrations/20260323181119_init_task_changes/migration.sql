/*
  Warnings:

  - A unique constraint covering the columns `[projectId,status,position]` on the table `Task` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `position` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'project_owner_transferred';
ALTER TYPE "NotificationType" ADD VALUE 'project_owner_transferred_from_you';
ALTER TYPE "NotificationType" ADD VALUE 'project_owner_transferred_to_you';

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_projectMemberId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_taskMemberId_fkey";

-- DropIndex
DROP INDEX "Task_projectId_status_idx";

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "description" TEXT,
ADD COLUMN     "position" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "Task_projectId_dueDate_idx" ON "Task"("projectId", "dueDate");

-- CreateIndex
CREATE INDEX "Task_projectId_status_position_idx" ON "Task"("projectId", "status", "position");

-- CreateIndex
CREATE UNIQUE INDEX "Task_projectId_status_position_key" ON "Task"("projectId", "status", "position");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_taskMemberId_fkey" FOREIGN KEY ("taskMemberId") REFERENCES "TaskMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_projectMemberId_fkey" FOREIGN KEY ("projectMemberId") REFERENCES "ProjectMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;
