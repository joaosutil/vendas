-- CreateTable
CREATE TABLE "EbookReaderState" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "activeChapter" INTEGER NOT NULL DEFAULT 0,
    "scrollProgress" INTEGER NOT NULL DEFAULT 0,
    "readChapters" INTEGER[],
    "completedModules" INTEGER[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EbookReaderState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EbookHighlight" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "chapterIndex" INTEGER NOT NULL,
    "paragraphIndex" INTEGER NOT NULL,
    "startOffset" INTEGER NOT NULL,
    "endOffset" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "selectedText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EbookHighlight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EbookReaderState_userId_idx" ON "EbookReaderState"("userId");

-- CreateIndex
CREATE INDEX "EbookReaderState_productId_idx" ON "EbookReaderState"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "EbookReaderState_userId_productId_key" ON "EbookReaderState"("userId", "productId");

-- CreateIndex
CREATE INDEX "EbookHighlight_userId_productId_idx" ON "EbookHighlight"("userId", "productId");

-- AddForeignKey
ALTER TABLE "EbookReaderState" ADD CONSTRAINT "EbookReaderState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EbookReaderState" ADD CONSTRAINT "EbookReaderState_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EbookHighlight" ADD CONSTRAINT "EbookHighlight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EbookHighlight" ADD CONSTRAINT "EbookHighlight_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
