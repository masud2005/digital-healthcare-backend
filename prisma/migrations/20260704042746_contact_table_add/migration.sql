-- CreateTable
CREATE TABLE "ContactSideWidget" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "opening" TEXT NOT NULL,
    "offDay" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "imageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactSideWidget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactPartnerSection" (
    "id" TEXT NOT NULL,
    "sectionTitle" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactPartnerSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactPartner" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactPartner_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ContactSideWidget" ADD CONSTRAINT "ContactSideWidget_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Attachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactPartner" ADD CONSTRAINT "ContactPartner_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "ContactPartnerSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactPartner" ADD CONSTRAINT "ContactPartner_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
