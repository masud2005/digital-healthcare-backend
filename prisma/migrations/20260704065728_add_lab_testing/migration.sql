-- CreateTable
CREATE TABLE "LabTestingHero" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "buttonText" TEXT,
    "buttonUrl" TEXT,
    "isBlank" BOOLEAN NOT NULL DEFAULT false,
    "imageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabTestingHero_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabTestingSection" (
    "id" TEXT NOT NULL,
    "sectionTitle" TEXT NOT NULL,
    "sectionDescription" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabTestingSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabTestService" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabTestService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabTest" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabTest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LabTestingHero" ADD CONSTRAINT "LabTestingHero_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Attachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabTestService" ADD CONSTRAINT "LabTestService_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "LabTestingSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabTestService" ADD CONSTRAINT "LabTestService_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Attachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabTest" ADD CONSTRAINT "LabTest_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "LabTestService"("id") ON DELETE CASCADE ON UPDATE CASCADE;
