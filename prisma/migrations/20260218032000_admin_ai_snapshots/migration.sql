-- CreateTable
CREATE TABLE "AdminInsightSnapshot" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fromDate" TEXT,
    "toDate" TEXT,
    "insights" JSONB NOT NULL,
    "creativeIdeas" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,

    CONSTRAINT "AdminInsightSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdminInsightSnapshot_createdAt_idx" ON "AdminInsightSnapshot"("createdAt");

-- CreateIndex
CREATE INDEX "AdminInsightSnapshot_createdById_idx" ON "AdminInsightSnapshot"("createdById");

-- AddForeignKey
ALTER TABLE "AdminInsightSnapshot" ADD CONSTRAINT "AdminInsightSnapshot_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
