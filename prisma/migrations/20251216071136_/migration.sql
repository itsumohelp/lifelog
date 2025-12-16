/*
  Warnings:

  - A unique constraint covering the columns `[teslaAccountId,teslaVehicleId]` on the table `TeslaVehicle` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[teslaAccountId,teslaVehicleIdS]` on the table `TeslaVehicle` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `teslaAccountId` to the `TeslaVehicle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TeslaVehicle" ADD COLUMN     "teslaAccountId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "TeslaAccount" (
    "id" TEXT NOT NULL,
    "teslaSub" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeslaAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeslaAccount_teslaSub_key" ON "TeslaAccount"("teslaSub");

-- CreateIndex
CREATE UNIQUE INDEX "TeslaVehicle_teslaAccountId_teslaVehicleId_key" ON "TeslaVehicle"("teslaAccountId", "teslaVehicleId");

-- CreateIndex
CREATE UNIQUE INDEX "TeslaVehicle_teslaAccountId_teslaVehicleIdS_key" ON "TeslaVehicle"("teslaAccountId", "teslaVehicleIdS");

-- AddForeignKey
ALTER TABLE "TeslaVehicle" ADD CONSTRAINT "TeslaVehicle_teslaAccountId_fkey" FOREIGN KEY ("teslaAccountId") REFERENCES "TeslaAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
