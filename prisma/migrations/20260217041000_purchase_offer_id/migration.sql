-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN "offerId" TEXT;

-- CreateIndex
CREATE INDEX "Purchase_offerId_idx" ON "Purchase"("offerId");

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
