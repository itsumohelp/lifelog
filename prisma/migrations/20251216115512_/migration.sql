-- CreateTable
CREATE TABLE "TeslaVehicleDailySnapshot" (
    "id" TEXT NOT NULL,
    "teslaAccountId" TEXT NOT NULL,
    "teslaVehicleId" BIGINT NOT NULL,
    "snapshotDate" TIMESTAMP(3) NOT NULL,
    "batteryLevel" INTEGER,
    "chargeLimitSoc" INTEGER,
    "odometerKm" DOUBLE PRECISION,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeslaVehicleDailySnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TeslaVehicleDailySnapshot_teslaAccountId_snapshotDate_idx" ON "TeslaVehicleDailySnapshot"("teslaAccountId", "snapshotDate");

-- CreateIndex
CREATE UNIQUE INDEX "TeslaVehicleDailySnapshot_teslaAccountId_teslaVehicleId_sna_key" ON "TeslaVehicleDailySnapshot"("teslaAccountId", "teslaVehicleId", "snapshotDate");

-- AddForeignKey
ALTER TABLE "TeslaVehicleDailySnapshot" ADD CONSTRAINT "TeslaVehicleDailySnapshot_teslaAccountId_fkey" FOREIGN KEY ("teslaAccountId") REFERENCES "TeslaAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
