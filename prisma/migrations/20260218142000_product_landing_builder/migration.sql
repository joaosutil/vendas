-- AlterTable
ALTER TABLE "Product"
ADD COLUMN "landingSlug" TEXT,
ADD COLUMN "landingEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "landingConfig" JSONB;

-- CreateIndex
CREATE UNIQUE INDEX "Product_landingSlug_key" ON "Product"("landingSlug");
