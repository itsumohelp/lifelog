/*
  Warnings:

  - You are about to drop the column `startWallet` on the `wallet` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "wallet" DROP COLUMN "startWallet",
ADD COLUMN     "startwallet" BOOLEAN NOT NULL DEFAULT false;
