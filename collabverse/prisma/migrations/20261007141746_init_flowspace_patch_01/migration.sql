/*
  Warnings:

  - The `openDoors` column on the `FlowSpace` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Doors" AS ENUM ('MainDoor1', 'MainDoor2', 'EntryDoor1', 'EntryDoor2', 'EntryDoor3', 'EntryDoor4', 'Bathroom2Male', 'Bathroom1Male', 'Bathroom1Female', 'Bathroom2Female', 'SecurityRoomDoor', 'DataCenterDoor', 'LibraryDoor', 'GymDoor', 'WorkshopDoor', 'HospitalDoor1', 'HospitalDoor2', 'Office5Door', 'Office4Door1', 'Office4Door2', 'BossBathroomDoor', 'MeetingRoomDoor', 'SportsRoomDoor', 'AuditoriumDoor1', 'AuditoriumDoor2', 'StoreroomDoor', 'Office2Door1', 'Office2Door2', 'Office3Door1', 'Office3Door2', 'Office3Door3', 'Office3Door4', 'JapDoor1', 'JapDoor2');

-- AlterTable
ALTER TABLE "FlowSpace" DROP COLUMN "openDoors",
ADD COLUMN     "openDoors" "Doors"[];

-- DropEnum
DROP TYPE "OpenDoor";
