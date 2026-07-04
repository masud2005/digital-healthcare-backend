-- CreateTable
CREATE TABLE "about_us" (
    "id" TEXT NOT NULL,
    "heroTitle" TEXT NOT NULL,
    "heroDescription" TEXT NOT NULL,
    "heroButtonText" TEXT,
    "heroButtonUrl" TEXT,
    "heroTargetBlank" BOOLEAN NOT NULL DEFAULT true,
    "bodySection1Title" TEXT NOT NULL,
    "bodySection1Description" TEXT NOT NULL,
    "bodySection1ButtonText" TEXT,
    "bodySection1ButtonUrl" TEXT,
    "bodySection1TargetBlank" BOOLEAN NOT NULL DEFAULT true,
    "bodySection1ImageId" TEXT,
    "bodySection2Tag" TEXT,
    "bodySection2Title" TEXT NOT NULL,
    "bodySection2Description" TEXT NOT NULL,
    "bodySection2ButtonText" TEXT,
    "bodySection2ButtonUrl" TEXT,
    "bodySection2TargetBlank" BOOLEAN NOT NULL DEFAULT true,
    "bodySection2ImageId" TEXT,
    "bodySection3Tag" TEXT,
    "bodySection3Title" TEXT NOT NULL,
    "bodySection3Description" TEXT NOT NULL,
    "bodySection3Points" JSONB,
    "bodySection3ButtonText" TEXT,
    "bodySection3ButtonUrl" TEXT,
    "bodySection3TargetBlank" BOOLEAN NOT NULL DEFAULT true,
    "bodySection3ImageId" TEXT,
    "faqSectionTitle" TEXT NOT NULL,
    "faqCardTitle" TEXT NOT NULL,
    "faqCardDescription" TEXT NOT NULL,
    "faqButtonText" TEXT,
    "faqButtonUrl" TEXT,
    "faqTargetBlank" BOOLEAN NOT NULL DEFAULT true,
    "faqCardImageId" TEXT,
    "faqs" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "about_us_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestRecordWidget" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RequestRecordWidget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestRecordWidgetItem" (
    "id" TEXT NOT NULL,
    "widgetId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RequestRecordWidgetItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "about_us" ADD CONSTRAINT "about_us_bodySection1ImageId_fkey" FOREIGN KEY ("bodySection1ImageId") REFERENCES "Attachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "about_us" ADD CONSTRAINT "about_us_bodySection2ImageId_fkey" FOREIGN KEY ("bodySection2ImageId") REFERENCES "Attachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "about_us" ADD CONSTRAINT "about_us_bodySection3ImageId_fkey" FOREIGN KEY ("bodySection3ImageId") REFERENCES "Attachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "about_us" ADD CONSTRAINT "about_us_faqCardImageId_fkey" FOREIGN KEY ("faqCardImageId") REFERENCES "Attachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestRecordWidgetItem" ADD CONSTRAINT "RequestRecordWidgetItem_widgetId_fkey" FOREIGN KEY ("widgetId") REFERENCES "RequestRecordWidget"("id") ON DELETE CASCADE ON UPDATE CASCADE;
