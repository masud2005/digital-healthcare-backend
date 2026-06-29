-- AddColumn google_review_id: nullable unique string (safe for live DB, no existing rows affected)
ALTER TABLE "testimonials" ADD COLUMN "google_review_id" TEXT;
ALTER TABLE "testimonials" ADD COLUMN "is_google_review_dirty" BOOLEAN NOT NULL DEFAULT false;

-- Create unique index on google_review_id (NULL values are excluded from uniqueness in PostgreSQL)
CREATE UNIQUE INDEX "testimonials_google_review_id_key" ON "testimonials"("google_review_id");
