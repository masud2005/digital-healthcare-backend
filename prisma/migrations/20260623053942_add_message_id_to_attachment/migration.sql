/*
  Warnings:

  - You are about to drop the column `closedDays` on the `SiteSettings` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `SiteSettings` table. All the data in the column will be lost.
  - You are about to drop the column `gaMeasurementId` on the `SiteSettings` table. All the data in the column will be lost.
  - You are about to drop the column `openHours` on the `SiteSettings` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `SiteSettings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Attachment" ADD COLUMN     "messageId" TEXT;

-- AlterTable
ALTER TABLE "SiteSettings" DROP COLUMN "closedDays",
DROP COLUMN "email",
DROP COLUMN "gaMeasurementId",
DROP COLUMN "openHours",
DROP COLUMN "phone";

-- CreateTable
CREATE TABLE "ContactInfo" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "openHours" TEXT,
    "closedDays" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoogleAnalyticsSetting" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "gaMeasurementId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleAnalyticsSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContactInfo_siteId_key" ON "ContactInfo"("siteId");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleAnalyticsSetting_siteId_key" ON "GoogleAnalyticsSetting"("siteId");

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactInfo" ADD CONSTRAINT "ContactInfo_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "SiteSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoogleAnalyticsSetting" ADD CONSTRAINT "GoogleAnalyticsSetting_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "SiteSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
