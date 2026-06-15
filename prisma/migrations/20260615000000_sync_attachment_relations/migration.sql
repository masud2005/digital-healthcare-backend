-- ============================================================
-- Migration: sync_attachment_relations
-- Syncs all schema changes that were applied locally via
-- `prisma db push` but never committed as proper migrations.
-- ============================================================

-- --------------------------------------------------------
-- 1. Extend the AttachmentContext enum with new variants
-- --------------------------------------------------------
ALTER TYPE "AttachmentContext" ADD VALUE IF NOT EXISTS 'HERO_IMAGE';
ALTER TYPE "AttachmentContext" ADD VALUE IF NOT EXISTS 'HERO_BADGE_IMAGE';
ALTER TYPE "AttachmentContext" ADD VALUE IF NOT EXISTS 'HOW_IT_WORKS_ICON';
ALTER TYPE "AttachmentContext" ADD VALUE IF NOT EXISTS 'WEBSITE_LOGO';
ALTER TYPE "AttachmentContext" ADD VALUE IF NOT EXISTS 'WEBSITE_FAVICON';
ALTER TYPE "AttachmentContext" ADD VALUE IF NOT EXISTS 'WEBSITE_SOCIAL_PREVIEW';
ALTER TYPE "AttachmentContext" ADD VALUE IF NOT EXISTS 'DOCTOR_AVATAR';
ALTER TYPE "AttachmentContext" ADD VALUE IF NOT EXISTS 'CONTACT_LEAD_ATTACHMENT';

-- --------------------------------------------------------
-- 2. Add productId FK column to Attachment
-- --------------------------------------------------------
ALTER TABLE "Attachment" ADD COLUMN IF NOT EXISTS "productId" TEXT;

-- CreateIndex for productId on Attachment
CREATE INDEX IF NOT EXISTS "Attachment_productId_idx" ON "Attachment"("productId");

-- AddForeignKey: Attachment -> Product
ALTER TABLE "Attachment" DROP CONSTRAINT IF EXISTS "Attachment_productId_fkey";
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- --------------------------------------------------------
-- 3. Product: remove old images TEXT[] column (data loss
--    acceptable — images are now stored in Attachment table)
-- --------------------------------------------------------
ALTER TABLE "Product" DROP COLUMN IF EXISTS "images";

-- Product.categoryId was NOT NULL in original schema but
-- the current model has it nullable. Relax the constraint.
ALTER TABLE "Product" ALTER COLUMN "categoryId" DROP NOT NULL;

-- --------------------------------------------------------
-- 4. ContactLead: swap old text columns for FK columns
-- --------------------------------------------------------
-- Drop old text columns
ALTER TABLE "ContactLead" DROP COLUMN IF EXISTS "attachments";
ALTER TABLE "ContactLead" DROP COLUMN IF EXISTS "responseAttachments";

-- Add new FK columns
ALTER TABLE "ContactLead" ADD COLUMN IF NOT EXISTS "attachment_id" TEXT;
ALTER TABLE "ContactLead" ADD COLUMN IF NOT EXISTS "response_attachment_id" TEXT;

-- Add unique indexes
CREATE UNIQUE INDEX IF NOT EXISTS "ContactLead_attachment_id_key"
  ON "ContactLead"("attachment_id");
CREATE UNIQUE INDEX IF NOT EXISTS "ContactLead_response_attachment_id_key"
  ON "ContactLead"("response_attachment_id");

-- AddForeignKeys
ALTER TABLE "ContactLead" DROP CONSTRAINT IF EXISTS "ContactLead_attachment_id_fkey";
ALTER TABLE "ContactLead" ADD CONSTRAINT "ContactLead_attachment_id_fkey"
  FOREIGN KEY ("attachment_id") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ContactLead" DROP CONSTRAINT IF EXISTS "ContactLead_response_attachment_id_fkey";
ALTER TABLE "ContactLead" ADD CONSTRAINT "ContactLead_response_attachment_id_fkey"
  FOREIGN KEY ("response_attachment_id") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- --------------------------------------------------------
-- 5. DoctorProfile: swap avatar TEXT for avatar_id FK
-- --------------------------------------------------------
ALTER TABLE "DoctorProfile" DROP COLUMN IF EXISTS "avatar";
ALTER TABLE "DoctorProfile" ADD COLUMN IF NOT EXISTS "avatar_id" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "DoctorProfile_avatar_id_key"
  ON "DoctorProfile"("avatar_id");

ALTER TABLE "DoctorProfile" DROP CONSTRAINT IF EXISTS "DoctorProfile_avatar_id_fkey";
ALTER TABLE "DoctorProfile" ADD CONSTRAINT "DoctorProfile_avatar_id_fkey"
  FOREIGN KEY ("avatar_id") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- --------------------------------------------------------
-- 6. SiteSettings: swap URL text columns for FK columns
-- --------------------------------------------------------
ALTER TABLE "SiteSettings" DROP COLUMN IF EXISTS "whiteLogoUrl";
ALTER TABLE "SiteSettings" DROP COLUMN IF EXISTS "blackLogoUrl";
ALTER TABLE "SiteSettings" DROP COLUMN IF EXISTS "faviconLightUrl";
ALTER TABLE "SiteSettings" DROP COLUMN IF EXISTS "faviconDarkUrl";
ALTER TABLE "SiteSettings" DROP COLUMN IF EXISTS "socialPreviewUrl";

ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "white_logo_id" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "black_logo_id" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "favicon_light_id" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "favicon_dark_id" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "social_preview_id" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "SiteSettings_white_logo_id_key"     ON "SiteSettings"("white_logo_id");
CREATE UNIQUE INDEX IF NOT EXISTS "SiteSettings_black_logo_id_key"     ON "SiteSettings"("black_logo_id");
CREATE UNIQUE INDEX IF NOT EXISTS "SiteSettings_favicon_light_id_key"  ON "SiteSettings"("favicon_light_id");
CREATE UNIQUE INDEX IF NOT EXISTS "SiteSettings_favicon_dark_id_key"   ON "SiteSettings"("favicon_dark_id");
CREATE UNIQUE INDEX IF NOT EXISTS "SiteSettings_social_preview_id_key" ON "SiteSettings"("social_preview_id");

ALTER TABLE "SiteSettings" DROP CONSTRAINT IF EXISTS "SiteSettings_white_logo_id_fkey";
ALTER TABLE "SiteSettings" ADD CONSTRAINT "SiteSettings_white_logo_id_fkey"
  FOREIGN KEY ("white_logo_id") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SiteSettings" DROP CONSTRAINT IF EXISTS "SiteSettings_black_logo_id_fkey";
ALTER TABLE "SiteSettings" ADD CONSTRAINT "SiteSettings_black_logo_id_fkey"
  FOREIGN KEY ("black_logo_id") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SiteSettings" DROP CONSTRAINT IF EXISTS "SiteSettings_favicon_light_id_fkey";
ALTER TABLE "SiteSettings" ADD CONSTRAINT "SiteSettings_favicon_light_id_fkey"
  FOREIGN KEY ("favicon_light_id") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SiteSettings" DROP CONSTRAINT IF EXISTS "SiteSettings_favicon_dark_id_fkey";
ALTER TABLE "SiteSettings" ADD CONSTRAINT "SiteSettings_favicon_dark_id_fkey"
  FOREIGN KEY ("favicon_dark_id") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SiteSettings" DROP CONSTRAINT IF EXISTS "SiteSettings_social_preview_id_fkey";
ALTER TABLE "SiteSettings" ADD CONSTRAINT "SiteSettings_social_preview_id_fkey"
  FOREIGN KEY ("social_preview_id") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- --------------------------------------------------------
-- 7. homepage_content: swap URL text columns for FK cols
-- --------------------------------------------------------
ALTER TABLE "homepage_content" DROP COLUMN IF EXISTS "hero_image_url";
ALTER TABLE "homepage_content" DROP COLUMN IF EXISTS "hero_badge_image_url";

ALTER TABLE "homepage_content" ADD COLUMN IF NOT EXISTS "hero_image_id" TEXT;
ALTER TABLE "homepage_content" ADD COLUMN IF NOT EXISTS "hero_badge_image_id" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "homepage_content_hero_image_id_key"
  ON "homepage_content"("hero_image_id");
CREATE UNIQUE INDEX IF NOT EXISTS "homepage_content_hero_badge_image_id_key"
  ON "homepage_content"("hero_badge_image_id");

ALTER TABLE "homepage_content" DROP CONSTRAINT IF EXISTS "homepage_content_hero_image_id_fkey";
ALTER TABLE "homepage_content" ADD CONSTRAINT "homepage_content_hero_image_id_fkey"
  FOREIGN KEY ("hero_image_id") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "homepage_content" DROP CONSTRAINT IF EXISTS "homepage_content_hero_badge_image_id_fkey";
ALTER TABLE "homepage_content" ADD CONSTRAINT "homepage_content_hero_badge_image_id_fkey"
  FOREIGN KEY ("hero_badge_image_id") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- --------------------------------------------------------
-- 8. how_it_works_steps: swap icon_url for icon_id FK
-- --------------------------------------------------------
ALTER TABLE "how_it_works_steps" DROP COLUMN IF EXISTS "icon_url";
ALTER TABLE "how_it_works_steps" ADD COLUMN IF NOT EXISTS "icon_id" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "how_it_works_steps_icon_id_key"
  ON "how_it_works_steps"("icon_id");

ALTER TABLE "how_it_works_steps" DROP CONSTRAINT IF EXISTS "how_it_works_steps_icon_id_fkey";
ALTER TABLE "how_it_works_steps" ADD CONSTRAINT "how_it_works_steps_icon_id_fkey"
  FOREIGN KEY ("icon_id") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
