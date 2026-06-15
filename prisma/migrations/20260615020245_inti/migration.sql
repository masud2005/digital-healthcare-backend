-- ============================================================
-- Migration: 20260615020245_inti
-- Converts all URL text columns to proper Attachment FK columns
-- and extends the AttachmentContext enum.
-- Uses IF NOT EXISTS / IF EXISTS guards to be fully idempotent.
-- ============================================================

-- --------------------------------------------------------
-- 1. Extend AttachmentContext enum (IF NOT EXISTS safe)
-- --------------------------------------------------------
DO $$ BEGIN
  ALTER TYPE "AttachmentContext" ADD VALUE 'HERO_IMAGE';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TYPE "AttachmentContext" ADD VALUE 'HERO_BADGE_IMAGE';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TYPE "AttachmentContext" ADD VALUE 'HOW_IT_WORKS_ICON';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TYPE "AttachmentContext" ADD VALUE 'WEBSITE_LOGO';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TYPE "AttachmentContext" ADD VALUE 'WEBSITE_FAVICON';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TYPE "AttachmentContext" ADD VALUE 'WEBSITE_SOCIAL_PREVIEW';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TYPE "AttachmentContext" ADD VALUE 'DOCTOR_AVATAR';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TYPE "AttachmentContext" ADD VALUE 'CONTACT_LEAD_ATTACHMENT';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- --------------------------------------------------------
-- 2. Attachment: add productId column
-- --------------------------------------------------------
ALTER TABLE "Attachment" ADD COLUMN IF NOT EXISTS "productId" TEXT;

-- --------------------------------------------------------
-- 3. ContactLead: drop old text cols, add FK cols
-- --------------------------------------------------------
ALTER TABLE "ContactLead" DROP COLUMN IF EXISTS "attachments";
ALTER TABLE "ContactLead" DROP COLUMN IF EXISTS "responseAttachments";
ALTER TABLE "ContactLead" ADD COLUMN IF NOT EXISTS "attachment_id" TEXT;
ALTER TABLE "ContactLead" ADD COLUMN IF NOT EXISTS "response_attachment_id" TEXT;

-- --------------------------------------------------------
-- 4. DoctorProfile: drop old avatar text col, add FK col
-- --------------------------------------------------------
ALTER TABLE "DoctorProfile" DROP COLUMN IF EXISTS "avatar";
ALTER TABLE "DoctorProfile" ADD COLUMN IF NOT EXISTS "avatar_id" TEXT;

-- --------------------------------------------------------
-- 5. Product: drop old images text[] col
-- --------------------------------------------------------
ALTER TABLE "Product" DROP COLUMN IF EXISTS "images";

-- --------------------------------------------------------
-- 6. SiteSettings: drop old URL cols, add FK cols
-- --------------------------------------------------------
ALTER TABLE "SiteSettings" DROP COLUMN IF EXISTS "blackLogoUrl";
ALTER TABLE "SiteSettings" DROP COLUMN IF EXISTS "faviconDarkUrl";
ALTER TABLE "SiteSettings" DROP COLUMN IF EXISTS "faviconLightUrl";
ALTER TABLE "SiteSettings" DROP COLUMN IF EXISTS "socialPreviewUrl";
ALTER TABLE "SiteSettings" DROP COLUMN IF EXISTS "whiteLogoUrl";
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "black_logo_id" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "favicon_dark_id" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "favicon_light_id" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "social_preview_id" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "white_logo_id" TEXT;

-- --------------------------------------------------------
-- 7. homepage_content: drop old URL cols, add FK cols
-- --------------------------------------------------------
ALTER TABLE "homepage_content" DROP COLUMN IF EXISTS "hero_badge_image_url";
ALTER TABLE "homepage_content" DROP COLUMN IF EXISTS "hero_image_url";
ALTER TABLE "homepage_content" ADD COLUMN IF NOT EXISTS "hero_badge_image_id" TEXT;
ALTER TABLE "homepage_content" ADD COLUMN IF NOT EXISTS "hero_image_id" TEXT;

-- --------------------------------------------------------
-- 8. how_it_works_steps: drop old icon_url col, add FK col
-- --------------------------------------------------------
ALTER TABLE "how_it_works_steps" DROP COLUMN IF EXISTS "icon_url";
ALTER TABLE "how_it_works_steps" ADD COLUMN IF NOT EXISTS "icon_id" TEXT;

-- --------------------------------------------------------
-- 9. Indexes
-- --------------------------------------------------------
CREATE INDEX IF NOT EXISTS "Attachment_productId_idx" ON "Attachment"("productId");

CREATE UNIQUE INDEX IF NOT EXISTS "ContactLead_attachment_id_key" ON "ContactLead"("attachment_id");
CREATE UNIQUE INDEX IF NOT EXISTS "ContactLead_response_attachment_id_key" ON "ContactLead"("response_attachment_id");

CREATE UNIQUE INDEX IF NOT EXISTS "DoctorProfile_avatar_id_key" ON "DoctorProfile"("avatar_id");

CREATE UNIQUE INDEX IF NOT EXISTS "SiteSettings_white_logo_id_key"     ON "SiteSettings"("white_logo_id");
CREATE UNIQUE INDEX IF NOT EXISTS "SiteSettings_black_logo_id_key"     ON "SiteSettings"("black_logo_id");
CREATE UNIQUE INDEX IF NOT EXISTS "SiteSettings_favicon_light_id_key"  ON "SiteSettings"("favicon_light_id");
CREATE UNIQUE INDEX IF NOT EXISTS "SiteSettings_favicon_dark_id_key"   ON "SiteSettings"("favicon_dark_id");
CREATE UNIQUE INDEX IF NOT EXISTS "SiteSettings_social_preview_id_key" ON "SiteSettings"("social_preview_id");

CREATE UNIQUE INDEX IF NOT EXISTS "homepage_content_hero_image_id_key"      ON "homepage_content"("hero_image_id");
CREATE UNIQUE INDEX IF NOT EXISTS "homepage_content_hero_badge_image_id_key" ON "homepage_content"("hero_badge_image_id");

CREATE UNIQUE INDEX IF NOT EXISTS "how_it_works_steps_icon_id_key" ON "how_it_works_steps"("icon_id");

-- --------------------------------------------------------
-- 10. Foreign Keys (drop first to avoid duplicate constraint errors)
-- --------------------------------------------------------
ALTER TABLE "Attachment" DROP CONSTRAINT IF EXISTS "Attachment_productId_fkey";
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ContactLead" DROP CONSTRAINT IF EXISTS "ContactLead_attachment_id_fkey";
ALTER TABLE "ContactLead" ADD CONSTRAINT "ContactLead_attachment_id_fkey"
  FOREIGN KEY ("attachment_id") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ContactLead" DROP CONSTRAINT IF EXISTS "ContactLead_response_attachment_id_fkey";
ALTER TABLE "ContactLead" ADD CONSTRAINT "ContactLead_response_attachment_id_fkey"
  FOREIGN KEY ("response_attachment_id") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "homepage_content" DROP CONSTRAINT IF EXISTS "homepage_content_hero_image_id_fkey";
ALTER TABLE "homepage_content" ADD CONSTRAINT "homepage_content_hero_image_id_fkey"
  FOREIGN KEY ("hero_image_id") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "homepage_content" DROP CONSTRAINT IF EXISTS "homepage_content_hero_badge_image_id_fkey";
ALTER TABLE "homepage_content" ADD CONSTRAINT "homepage_content_hero_badge_image_id_fkey"
  FOREIGN KEY ("hero_badge_image_id") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "how_it_works_steps" DROP CONSTRAINT IF EXISTS "how_it_works_steps_icon_id_fkey";
ALTER TABLE "how_it_works_steps" ADD CONSTRAINT "how_it_works_steps_icon_id_fkey"
  FOREIGN KEY ("icon_id") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DoctorProfile" DROP CONSTRAINT IF EXISTS "DoctorProfile_avatar_id_fkey";
ALTER TABLE "DoctorProfile" ADD CONSTRAINT "DoctorProfile_avatar_id_fkey"
  FOREIGN KEY ("avatar_id") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
