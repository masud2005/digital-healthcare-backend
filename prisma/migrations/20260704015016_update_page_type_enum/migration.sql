-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PageType" ADD VALUE 'AboutUs';
ALTER TYPE "PageType" ADD VALUE 'ContactUs';
ALTER TYPE "PageType" ADD VALUE 'PrivacyPolicy';
ALTER TYPE "PageType" ADD VALUE 'TermsOfService';
ALTER TYPE "PageType" ADD VALUE 'HippaNotice';
ALTER TYPE "PageType" ADD VALUE 'ReportSideEffect';
ALTER TYPE "PageType" ADD VALUE 'RequestRecord';

-- CreateTable
CREATE TABLE "hero_section" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "page" "PageType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hero_section_pkey" PRIMARY KEY ("id")
);
