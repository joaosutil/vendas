-- AlterTable
ALTER TABLE "Purchase"
ADD COLUMN "paymentMethod" TEXT,
ADD COLUMN "currency" TEXT,
ADD COLUMN "grossAmountCents" INTEGER,
ADD COLUMN "feeAmountCents" INTEGER,
ADD COLUMN "netAmountCents" INTEGER,
ADD COLUMN "paymentMeta" JSONB;

-- CreateIndex
CREATE INDEX "Purchase_paymentMethod_idx" ON "Purchase"("paymentMethod");
