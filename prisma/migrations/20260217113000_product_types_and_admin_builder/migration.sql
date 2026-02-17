-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('EBOOK', 'VIDEO_COURSE', 'OTHER');

-- AlterTable
ALTER TABLE "Product"
ADD COLUMN "description" TEXT,
ADD COLUMN "type" "ProductType" NOT NULL DEFAULT 'EBOOK';

-- CreateTable
CREATE TABLE "ProductEbookAsset" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductEbookAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductEbookAsset_productId_key" ON "ProductEbookAsset"("productId");

-- AddForeignKey
ALTER TABLE "ProductEbookAsset" ADD CONSTRAINT "ProductEbookAsset_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
