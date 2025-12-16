/*
  Warnings:

  - You are about to drop the column `todoId` on the `article` table. All the data in the column will be lost.
  - You are about to drop the `todo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `todoshare` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "article" DROP CONSTRAINT "article_todoId_fkey";

-- DropForeignKey
ALTER TABLE "todoshare" DROP CONSTRAINT "todoshare_todoId_fkey";

-- DropForeignKey
ALTER TABLE "todoshare" DROP CONSTRAINT "todoshare_userId_fkey";

-- AlterTable
ALTER TABLE "article" DROP COLUMN "todoId";

-- DropTable
DROP TABLE "todo";

-- DropTable
DROP TABLE "todoshare";

-- CreateTable
CREATE TABLE "walletshare" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "walletshare_id_key" ON "walletshare"("id");

-- AddForeignKey
ALTER TABLE "walletshare" ADD CONSTRAINT "walletshare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "walletshare" ADD CONSTRAINT "walletshare_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
