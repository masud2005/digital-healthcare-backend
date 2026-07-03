-- CreateEnum
CREATE TYPE "PageType" AS ENUM ('ServiceCategory', 'Blog', 'BlogDetail', 'LabTest', 'MedicalTeam', 'HowItWorks', 'Eligiblity', 'Coverage', 'Faq', 'BillingCancellation', 'ShippingInfo');

-- CreateTable
CREATE TABLE "cta_sections" (
    "id" SERIAL NOT NULL,
    "page" "PageType" NOT NULL,
    "sectionTitle" VARCHAR(255) NOT NULL,
    "ctaButtonText" VARCHAR(100) NOT NULL,
    "url" TEXT NOT NULL,
    "openInNewTab" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cta_sections_pkey" PRIMARY KEY ("id")
);
