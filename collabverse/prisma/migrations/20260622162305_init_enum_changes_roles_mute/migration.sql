/*
  Warnings:

  - The values [media] on the enum `MessageType` will be removed. If these variants are still used in the database, this will fail.
  - The values [eight,week,always] on the enum `MuteEnum` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MessageType_new" AS ENUM ('text', 'audio', 'video', 'album', 'photo', 'document', 'system', 'call');
ALTER TABLE "Message" ALTER COLUMN "type" TYPE "MessageType_new" USING ("type"::text::"MessageType_new");
ALTER TYPE "MessageType" RENAME TO "MessageType_old";
ALTER TYPE "MessageType_new" RENAME TO "MessageType";
DROP TYPE "public"."MessageType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "MuteEnum_new" AS ENUM ('Eight', 'Week', 'Always');
ALTER TABLE "ConversationMember" ALTER COLUMN "mutedFor" TYPE "MuteEnum_new" USING ("mutedFor"::text::"MuteEnum_new");
ALTER TYPE "MuteEnum" RENAME TO "MuteEnum_old";
ALTER TYPE "MuteEnum_new" RENAME TO "MuteEnum";
DROP TYPE "public"."MuteEnum_old";
COMMIT;
