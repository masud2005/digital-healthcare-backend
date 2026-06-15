/*
  Warnings:

  - You are about to drop the column `attachments` on the `ContactLead` table. All the data in the column will be lost.
  - You are about to drop the column `responseAttachments` on the `ContactLead` table. All the data in the column will be lost.
  - You are about to drop the column `avatar` on the `DoctorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `images` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `blackLogoUrl` on the `SiteSettings` table. All the data in the column will be lost.
  - You are about to drop the column `faviconDarkUrl` on the `SiteSettings` table. All the data in the column will be lost.
  - You are about to drop the column `faviconLightUrl` on the `SiteSettings` table. All the data in the column will be lost.
  - You are about to drop the column `socialPreviewUrl` on the `SiteSettings` table. All the data in the column will be lost.
  - You are about to drop the column `whiteLogoUrl` on the `SiteSettings` table. All the data in the column will be lost.
  - You are about to drop the column `hero_badge_image_url` on the `homepage_content` table. All the data in the column will be lost.
  - You are about to drop the column `hero_image_url` on the `homepage_content` table. All the data in the column will be lost.
  - You are about to drop the column `icon_url` on the `how_it_works_steps` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[attachment_id]` on the table `ContactLead` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[response_attachment_id]` on the table `ContactLead` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[avatar_id]` on the table `DoctorProfile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[white_logo_id]` on the table `SiteSettings` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[black_logo_id]` on the table `SiteSettings` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[favicon_light_id]` on the table `SiteSettings` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[favicon_dark_id]` on the table `SiteSettings` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[social_preview_id]` on the table `SiteSettings` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[hero_image_id]` on the table `homepage_content` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[hero_badge_image_id]` on the table `homepage_content` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[icon_id]` on the table `how_it_works_steps` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AttachmentContext" ADD VALUE 'HERO_IMAGE';
ALTER TYPE "AttachmentContext" ADD VALUE 'HERO_BADGE_IMAGE';
ALTER TYPE "AttachmentContext" ADD VALUE 'HOW_IT_WORKS_ICON';
ALTER TYPE "AttachmentContext" ADD VALUE 'WEBSITE_LOGO';
ALTER TYPE "AttachmentContext" ADD VALUE 'WEBSITE_FAVICON';
ALTER TYPE "AttachmentContext" ADD VALUE 'WEBSITE_SOCIAL_PREVIEW';
ALTER TYPE "AttachmentContext" ADD VALUE 'DOCTOR_AVATAR';
ALTER TYPE "AttachmentContext" ADD VALUE 'CONTACT_LEAD_ATTACHMENT';

-- AlterTable
ALTER TABLE "Attachment" ADD COLUMN     "productId" TEXT;

-- AlterTable
ALTER TABLE "ContactLead" DROP COLUMN "attachments",
DROP COLUMN "responseAttachments",
ADD COLUMN     "attachment_id" TEXT,
ADD COLUMN     "response_attachment_id" TEXT;

-- AlterTable
ALTER TABLE "DoctorProfile" DROP COLUMN "avatar",
ADD COLUMN     "avatar_id" TEXT;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "images";

-- AlterTable
ALTER TABLE "SiteSettings" DROP COLUMN "blackLogoUrl",
DROP COLUMN "faviconDarkUrl",
DROP COLUMN "faviconLightUrl",
DROP COLUMN "socialPreviewUrl",
DROP COLUMN "whiteLogoUrl",
ADD COLUMN     "black_logo_id" TEXT,
ADD COLUMN     "favicon_dark_id" TEXT,
ADD COLUMN     "favicon_light_id" TEXT,
ADD COLUMN     "social_preview_id" TEXT,
ADD COLUMN     "white_logo_id" TEXT;

-- AlterTable
ALTER TABLE "homepage_content" DROP COLUMN "hero_badge_image_url",
DROP COLUMN "hero_image_url",
ADD COLUMN     "hero_badge_image_id" TEXT,
ADD COLUMN     "hero_image_id" TEXT;

-- AlterTable
ALTER TABLE "how_it_works_steps" DROP COLUMN "icon_url",
ADD COLUMN     "icon_id" TEXT;

-- CreateIndex
CREATE INDEX "Attachment_productId_idx" ON "Attachment"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "ContactLead_attachment_id_key" ON "ContactLead"("attachment_id");

-- CreateIndex
CREATE UNIQUE INDEX "ContactLead_response_attachment_id_key" ON "ContactLead"("response_attachment_id");

-- CreateIndex
CREATE UNIQUE INDEX "DoctorProfile_avatar_id_key" ON "DoctorProfile"("avatar_id");

-- CreateIndex
CREATE UNIQUE INDEX "SiteSettings_white_logo_id_key" ON "SiteSettings"("white_logo_id");

-- CreateIndex
CREATE UNIQUE INDEX "SiteSettings_black_logo_id_key" ON "SiteSettings"("black_logo_id");

-- CreateIndex
CREATE UNIQUE INDEX "SiteSettings_favicon_light_id_key" ON "SiteSettings"("favicon_light_id");

-- CreateIndex
CREATE UNIQUE INDEX "SiteSettings_favicon_dark_id_key" ON "SiteSettings"("favicon_dark_id");

-- CreateIndex
CREATE UNIQUE INDEX "SiteSettings_social_preview_id_key" ON "SiteSettings"("social_preview_id");

-- CreateIndex
CREATE UNIQUE INDEX "homepage_content_hero_image_id_key" ON "homepage_content"("hero_image_id");

-- CreateIndex
CREATE UNIQUE INDEX "homepage_content_hero_badge_image_id_key" ON "homepage_content"("hero_badge_image_id");

-- CreateIndex
CREATE UNIQUE INDEX "how_it_works_steps_icon_id_key" ON "how_it_works_steps"("icon_id");

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactLead" ADD CONSTRAINT "ContactLead_attachment_id_fkey" FOREIGN KEY ("attachment_id") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactLead" ADD CONSTRAINT "ContactLead_response_attachment_id_fkey" FOREIGN KEY ("response_attachment_id") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homepage_content" ADD CONSTRAINT "homepage_content_hero_image_id_fkey" FOREIGN KEY ("hero_image_id") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homepage_content" ADD CONSTRAINT "homepage_content_hero_badge_image_id_fkey" FOREIGN KEY ("hero_badge_image_id") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "how_it_works_steps" ADD CONSTRAINT "how_it_works_steps_icon_id_fkey" FOREIGN KEY ("icon_id") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorProfile" ADD CONSTRAINT "DoctorProfile_avatar_id_fkey" FOREIGN KEY ("avatar_id") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteSettings" ADD CONSTRAINT "SiteSettings_white_logo_id_fkey" FOREIGN KEY ("white_logo_id") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteSettings" ADD CONSTRAINT "SiteSettings_black_logo_id_fkey" FOREIGN KEY ("black_logo_id") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteSettings" ADD CONSTRAINT "SiteSettings_favicon_light_id_fkey" FOREIGN KEY ("favicon_light_id") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteSettings" ADD CONSTRAINT "SiteSettings_favicon_dark_id_fkey" FOREIGN KEY ("favicon_dark_id") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteSettings" ADD CONSTRAINT "SiteSettings_social_preview_id_fkey" FOREIGN KEY ("social_preview_id") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
