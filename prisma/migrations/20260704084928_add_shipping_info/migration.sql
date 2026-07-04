-- CreateTable
CREATE TABLE "how_it_works" (
    "id" TEXT NOT NULL,
    "sectionTitle" TEXT NOT NULL,
    "sectionDescription" TEXT NOT NULL,
    "steps" JSONB,
    "disclaimerTitle" TEXT NOT NULL,
    "disclaimerDescription" TEXT NOT NULL,
    "faqSectionTitle" TEXT NOT NULL,
    "faqs" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "how_it_works_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerPharmacySection" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerPharmacySection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerPharmacy" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "logoId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerPharmacy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShippingTimelineSection" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShippingTimelineSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShippingTimelineStep" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShippingTimelineStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShippingPolicySection" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "disclaimerTitle" VARCHAR(255) NOT NULL,
    "disclaimerDescription" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShippingPolicySection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShippingPolicyItem" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "text" VARCHAR(255) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShippingPolicyItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PartnerPharmacy" ADD CONSTRAINT "PartnerPharmacy_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "PartnerPharmacySection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerPharmacy" ADD CONSTRAINT "PartnerPharmacy_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "Attachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingTimelineStep" ADD CONSTRAINT "ShippingTimelineStep_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "ShippingTimelineSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingPolicyItem" ADD CONSTRAINT "ShippingPolicyItem_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "ShippingPolicySection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
