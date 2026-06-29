-- AddColumn google_avatar_url: nullable text, stores the Google profile photo CDN URL
-- Safe for live DB — purely additive, no existing rows are modified
ALTER TABLE "testimonials" ADD COLUMN "google_avatar_url" TEXT;
