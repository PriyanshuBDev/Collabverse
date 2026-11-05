/*
  Warnings:

  - You are about to drop the column `publicId` on the `Attachment` table. All the data in the column will be lost.
  - You are about to drop the column `bytes` on the `MessageMedia` table. All the data in the column will be lost.
  - Added the required column `originalName` to the `Attachment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `path` to the `Attachment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalName` to the `MessageMedia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `MessageMedia` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Attachment" DROP COLUMN "publicId",
ADD COLUMN     "originalName" TEXT NOT NULL,
ADD COLUMN     "path" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "MessageMedia" DROP COLUMN "bytes",
ADD COLUMN     "originalName" TEXT NOT NULL,
ADD COLUMN     "size" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "username" DROP NOT NULL;
