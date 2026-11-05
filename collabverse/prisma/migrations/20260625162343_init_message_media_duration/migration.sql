/*
  Warnings:

  - You are about to drop the column `publicId` on the `MessageMedia` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MessageMedia" DROP COLUMN "publicId",
ADD COLUMN     "duration" INTEGER;
