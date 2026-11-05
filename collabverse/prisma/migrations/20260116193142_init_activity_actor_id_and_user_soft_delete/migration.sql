/*
  Warnings:

  - Added the required column `actorUserId` to the `Activity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "actorUserId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Activity_actorUserId_idx" ON "Activity"("actorUserId");

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
