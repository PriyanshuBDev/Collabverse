-- CreateEnum
CREATE TYPE "Direction" AS ENUM ('up', 'down', 'left', 'right');

-- CreateEnum
CREATE TYPE "OpenDoor" AS ENUM ('MainDoor1', 'MainDoor2', 'EntryDoor1', 'EntryDoor2', 'EntryDoor3', 'EntryDoor4', 'Bathroom2Male', 'Bathroom1Male', 'Bathroom1Female', 'Bathroom2Female', 'SecurityRoomDoor', 'DataCenterDoor', 'LibraryDoor', 'GymDoor', 'WorkshopDoor', 'HospitalDoor1', 'HospitalDoor2', 'Office5Door', 'Office4Door1', 'Office4Door2', 'BossBathroomDoor', 'MeetingRoomDoor', 'SportsRoomDoor', 'AuditoriumDoor1', 'AuditoriumDoor2', 'StoreroomDoor', 'Office2Door1', 'Office2Door2', 'Office3Door1', 'Office3Door2', 'Office3Door3', 'Office3Door4', 'JapDoor1', 'JapDoor2');

-- CreateEnum
CREATE TYPE "PlayerEmote" AS ENUM ('yellowExclamation', 'redExclamation', 'dollar', 'blueQuestionMark', 'yellowQuestionMark', 'zzz', 'yellowPlus', 'brokenHeart', 'letter', 'music', 'sunshine', 'night', 'angry', 'thinking', 'blush', 'waterDroplet', 'heart', 'nothing');

-- CreateTable
CREATE TABLE "UserAppearance" (
    "userId" TEXT NOT NULL,
    "bodyId" TEXT NOT NULL DEFAULT 'body-01',
    "outfit" TEXT NOT NULL DEFAULT 'outfit-01',
    "hairstyle" TEXT NOT NULL DEFAULT 'hairstyle-01',
    "eyes" TEXT NOT NULL DEFAULT 'eyes-01',
    "accessory" TEXT,
    "musicLevel" INTEGER NOT NULL DEFAULT 3,
    "dnd" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "FlowSpace" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "openDoors" "OpenDoor"[],

    CONSTRAINT "FlowSpace_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserAppearance_userId_key" ON "UserAppearance"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FlowSpace_projectId_key" ON "FlowSpace"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "FlowSpace_id_projectId_key" ON "FlowSpace"("id", "projectId");

-- AddForeignKey
ALTER TABLE "UserAppearance" ADD CONSTRAINT "UserAppearance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlowSpace" ADD CONSTRAINT "FlowSpace_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
