/*
  Warnings:

  - Added the required column `order` to the `MessageMedia` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MessageMedia" ADD COLUMN     "order" INTEGER NOT NULL;
