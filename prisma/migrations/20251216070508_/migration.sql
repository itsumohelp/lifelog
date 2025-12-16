/*
  Warnings:

  - You are about to drop the `VerificationToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `article` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `authenticator` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `come` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `wallet` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `walletshare` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."account" DROP CONSTRAINT "account_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."article" DROP CONSTRAINT "article_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."authenticator" DROP CONSTRAINT "authenticator_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."come" DROP CONSTRAINT "come_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."come" DROP CONSTRAINT "come_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."come" DROP CONSTRAINT "come_walletId_fkey";

-- DropForeignKey
ALTER TABLE "public"."session" DROP CONSTRAINT "session_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."wallet" DROP CONSTRAINT "wallet_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."walletshare" DROP CONSTRAINT "walletshare_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."walletshare" DROP CONSTRAINT "walletshare_walletId_fkey";

-- DropTable
DROP TABLE "public"."VerificationToken";

-- DropTable
DROP TABLE "public"."account";

-- DropTable
DROP TABLE "public"."article";

-- DropTable
DROP TABLE "public"."authenticator";

-- DropTable
DROP TABLE "public"."category";

-- DropTable
DROP TABLE "public"."come";

-- DropTable
DROP TABLE "public"."session";

-- DropTable
DROP TABLE "public"."user";

-- DropTable
DROP TABLE "public"."wallet";

-- DropTable
DROP TABLE "public"."walletshare";

-- CreateTable
CREATE TABLE "TeslaVehicle" (
    "id" TEXT NOT NULL,
    "teslaVehicleId" BIGINT NOT NULL,
    "displayName" TEXT,
    "state" TEXT,
    "accessType" TEXT,
    "teslaVehicleIdS" TEXT,
    "rawJson" JSONB,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeslaVehicle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeslaVehicle_teslaVehicleId_key" ON "TeslaVehicle"("teslaVehicleId");

-- CreateIndex
CREATE UNIQUE INDEX "TeslaVehicle_teslaVehicleIdS_key" ON "TeslaVehicle"("teslaVehicleIdS");
