-- CreateTable
CREATE TABLE "hippa_notices" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hippa_notices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalTeamSection" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicalTeamSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "privacy_policies" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "privacy_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "side_widget" (
    "id" TEXT NOT NULL,
    "page" "PageType" NOT NULL,
    "title" VARCHAR(255),
    "buttonText" VARCHAR(100),
    "buttonUrl" VARCHAR(255),
    "isBlank" BOOLEAN NOT NULL DEFAULT false,
    "imageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "side_widget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "terms_of_services" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "terms_of_services_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "side_widget" ADD CONSTRAINT "side_widget_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Attachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
