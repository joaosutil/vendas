-- AlterTable
ALTER TABLE "User"
ADD COLUMN "avatarUrl" TEXT,
ADD COLUMN "alertsEnabled" BOOLEAN NOT NULL DEFAULT true;
