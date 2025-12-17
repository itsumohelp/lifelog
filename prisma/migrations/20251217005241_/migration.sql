-- CreateEnum
CREATE TYPE "TeslaMode" AS ENUM ('MANUAL', 'AUTO');

-- CreateTable
CREATE TABLE "TeslaSettings" (
    "id" TEXT NOT NULL,
    "teslaAccountId" TEXT NOT NULL,
    "mode" "TeslaMode" NOT NULL DEFAULT 'MANUAL',
    "consentGivenAt" TIMESTAMP(3),
    "consentVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeslaSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeslaAuthToken" (
    "id" TEXT NOT NULL,
    "teslaAccountId" TEXT NOT NULL,
    "accessTokenEnc" TEXT,
    "refreshTokenEnc" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeslaAuthToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeslaSettings_teslaAccountId_key" ON "TeslaSettings"("teslaAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "TeslaAuthToken_teslaAccountId_key" ON "TeslaAuthToken"("teslaAccountId");

-- AddForeignKey
ALTER TABLE "TeslaSettings" ADD CONSTRAINT "TeslaSettings_teslaAccountId_fkey" FOREIGN KEY ("teslaAccountId") REFERENCES "TeslaAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeslaAuthToken" ADD CONSTRAINT "TeslaAuthToken_teslaAccountId_fkey" FOREIGN KEY ("teslaAccountId") REFERENCES "TeslaAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
