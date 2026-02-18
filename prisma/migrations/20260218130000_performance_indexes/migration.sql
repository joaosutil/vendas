-- CreateIndex
CREATE INDEX IF NOT EXISTS "User_active_idx" ON "User"("active");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Purchase_createdAt_status_idx" ON "Purchase"("createdAt", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Purchase_userId_createdAt_idx" ON "Purchase"("userId", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Purchase_status_createdAt_idx" ON "Purchase"("status", "createdAt");
