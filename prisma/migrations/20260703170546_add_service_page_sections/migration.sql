-- CreateTable
CREATE TABLE "service_page_hero_sections" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "bannerImageId" TEXT,
    "pageTitle" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_page_hero_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_page_second_sections" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "sectionTitle" VARCHAR(255) NOT NULL,
    "sectionDescription" TEXT NOT NULL,
    "ctaButtonText" VARCHAR(100) NOT NULL,
    "url" TEXT NOT NULL,
    "buttonTarget" BOOLEAN NOT NULL DEFAULT false,
    "featuredMediaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_page_second_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_page_faq_sections" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "sectionTitle" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_page_faq_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_page_faq_items" (
    "id" TEXT NOT NULL,
    "faqSectionId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_page_faq_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "service_page_hero_sections_categoryId_key" ON "service_page_hero_sections"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "service_page_hero_sections_bannerImageId_key" ON "service_page_hero_sections"("bannerImageId");

-- CreateIndex
CREATE UNIQUE INDEX "service_page_second_sections_categoryId_key" ON "service_page_second_sections"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "service_page_second_sections_featuredMediaId_key" ON "service_page_second_sections"("featuredMediaId");

-- CreateIndex
CREATE UNIQUE INDEX "service_page_faq_sections_categoryId_key" ON "service_page_faq_sections"("categoryId");

-- AddForeignKey
ALTER TABLE "service_page_hero_sections" ADD CONSTRAINT "service_page_hero_sections_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_page_hero_sections" ADD CONSTRAINT "service_page_hero_sections_bannerImageId_fkey" FOREIGN KEY ("bannerImageId") REFERENCES "Attachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_page_second_sections" ADD CONSTRAINT "service_page_second_sections_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_page_second_sections" ADD CONSTRAINT "service_page_second_sections_featuredMediaId_fkey" FOREIGN KEY ("featuredMediaId") REFERENCES "Attachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_page_faq_sections" ADD CONSTRAINT "service_page_faq_sections_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_page_faq_items" ADD CONSTRAINT "service_page_faq_items_faqSectionId_fkey" FOREIGN KEY ("faqSectionId") REFERENCES "service_page_faq_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
