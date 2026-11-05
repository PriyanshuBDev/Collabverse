/*
  Warnings:

  - The values [Ringing] on the enum `CallStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `isMuted` on the `CallParticipant` table. All the data in the column will be lost.
  - You are about to drop the column `isVideoOff` on the `CallParticipant` table. All the data in the column will be lost.
  - You are about to drop the column `worksapceId` on the `CallSession` table. All the data in the column will be lost.
  - Added the required column `workspaceId` to the `CallParticipant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspaceId` to the `CallSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CallStatus_new" AS ENUM ('Calling', 'Active', 'Ended', 'Missed', 'Rejected', 'Cancelled', 'Busy', 'Failed');
ALTER TABLE "CallSession" ALTER COLUMN "status" TYPE "CallStatus_new" USING ("status"::text::"CallStatus_new");
ALTER TYPE "CallStatus" RENAME TO "CallStatus_old";
ALTER TYPE "CallStatus_new" RENAME TO "CallStatus";
DROP TYPE "public"."CallStatus_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "CallSession" DROP CONSTRAINT "CallSession_startedById_fkey";

-- AlterTable
ALTER TABLE "CallParticipant" DROP COLUMN "isMuted",
DROP COLUMN "isVideoOff",
ADD COLUMN     "workspaceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CallSession" DROP COLUMN "worksapceId",
ADD COLUMN     "workspaceId" TEXT NOT NULL,
ALTER COLUMN "startedAt" DROP NOT NULL,
ALTER COLUMN "startedAt" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "CallParticipant" ADD CONSTRAINT "CallParticipant_userId_workspaceId_fkey" FOREIGN KEY ("userId", "workspaceId") REFERENCES "WorkspaceMember"("userId", "workspaceId") ON DELETE RESTRICT ON UPDATE CASCADE;
