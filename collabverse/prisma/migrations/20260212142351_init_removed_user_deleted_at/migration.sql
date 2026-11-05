/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "deletedAt";

-- CreateIndex
CREATE INDEX "User_name_id_idx" ON "User"("name", "id");
