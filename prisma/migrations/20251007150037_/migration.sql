/*
  Warnings:

  - You are about to drop the column `startwallet` on the `wallet` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "come" ADD COLUMN     "categoryId" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "inout" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "wallet" DROP COLUMN "startwallet";

-- CreateTable
CREATE TABLE "category" (
    "id" INTEGER NOT NULL,
    "categoryName" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "category_id_key" ON "category"("id");

-- AddForeignKey
ALTER TABLE "come" ADD CONSTRAINT "come_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
