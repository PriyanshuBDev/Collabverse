/*
  Warnings:

  - The values [Add_Members] on the enum `GroupPerm` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "GroupPerm_new" AS ENUM ('Edit_Group_Details', 'Send_Messages', 'Pin', 'Send_Files');
ALTER TABLE "GroupPermission" ALTER COLUMN "permissions" TYPE "GroupPerm_new"[] USING ("permissions"::text::"GroupPerm_new"[]);
ALTER TYPE "GroupPerm" RENAME TO "GroupPerm_old";
ALTER TYPE "GroupPerm_new" RENAME TO "GroupPerm";
DROP TYPE "public"."GroupPerm_old";
COMMIT;
