/*
  Warnings:

  - A unique constraint covering the columns `[productNo]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "hemService" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "productNo" TEXT,
ADD COLUMN     "sizeInfo" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Product_productNo_key" ON "Product"("productNo");
