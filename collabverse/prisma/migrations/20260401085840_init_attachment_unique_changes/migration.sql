/*
  Warnings:

  - A unique constraint covering the columns `[createdAt,id]` on the table `Attachment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Attachment_createdAt_id_key" ON "Attachment"("createdAt", "id");
