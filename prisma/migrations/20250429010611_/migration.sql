/*
  Warnings:

  - You are about to drop the column `default` on the `wallet` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "wallet" DROP COLUMN "default",
ADD COLUMN     "defaultWallet" BOOLEAN NOT NULL DEFAULT false;
