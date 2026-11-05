/*
  Warnings:

  - You are about to drop the column `addMembers` on the `GroupPermission` table. All the data in the column will be lost.
  - You are about to drop the column `editGroupSettings` on the `GroupPermission` table. All the data in the column will be lost.
  - You are about to drop the column `pin` on the `GroupPermission` table. All the data in the column will be lost.
  - You are about to drop the column `sendMedia` on the `GroupPermission` table. All the data in the column will be lost.
  - You are about to drop the column `sendMessages` on the `GroupPermission` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "GroupPerm" AS ENUM ('Edit_Group_Details', 'Send_Messages', 'Add_Members', 'Pin', 'Send_Media');

-- AlterTable
ALTER TABLE "ConversationMember" ALTER COLUMN "status" DROP NOT NULL;

-- AlterTable
ALTER TABLE "GroupPermission" DROP COLUMN "addMembers",
DROP COLUMN "editGroupSettings",
DROP COLUMN "pin",
DROP COLUMN "sendMedia",
DROP COLUMN "sendMessages",
ADD COLUMN     "permissions" "GroupPerm"[];
