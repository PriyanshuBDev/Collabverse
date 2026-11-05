/*
  Warnings:

  - You are about to drop the `CommentDeletion` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `reactedById` on table `CommentReaction` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "CommentDeletion" DROP CONSTRAINT "CommentDeletion_commentId_fkey";

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "replyPreview" JSONB;

-- AlterTable
ALTER TABLE "CommentReaction" ALTER COLUMN "reactedById" SET NOT NULL;

-- DropTable
DROP TABLE "CommentDeletion";

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_commentedById_taskId_fkey" FOREIGN KEY ("commentedById", "taskId") REFERENCES "TaskMember"("projectMemberUserId", "taskId") ON DELETE RESTRICT ON UPDATE CASCADE;
