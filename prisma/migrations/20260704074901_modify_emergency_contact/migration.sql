-- CreateTable
CREATE TABLE "SymptomSeverity" (
    "id" TEXT NOT NULL,
    "text" VARCHAR(255) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SymptomSeverity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmergencyContactWidget" (
    "id" TEXT NOT NULL,
    "sectionTitle" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmergencyContactWidget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmergencyContact" (
    "id" TEXT NOT NULL,
    "widgetId" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "contact" VARCHAR(255) NOT NULL,
    "notes" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmergencyContact_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EmergencyContact" ADD CONSTRAINT "EmergencyContact_widgetId_fkey" FOREIGN KEY ("widgetId") REFERENCES "EmergencyContactWidget"("id") ON DELETE CASCADE ON UPDATE CASCADE;
