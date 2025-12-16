/*
  Warnings:

  - You are about to drop the column `defaultWallet` on the `wallet` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "wallet" DROP COLUMN "defaultWallet",
ADD COLUMN     "startWallet" BOOLEAN NOT NULL DEFAULT false;
