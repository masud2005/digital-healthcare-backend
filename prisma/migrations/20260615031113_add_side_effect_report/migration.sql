-- CreateEnum (idempotent)
DO $$ BEGIN
  CREATE TYPE "SideEffectSeverity" AS ENUM ('MILD', 'MODERATE', 'SEVERE', 'LIFE_THREATENING');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "SideEffectStatus" AS ENUM ('PENDING', 'REVIEWED', 'ESCALATED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- AlterEnum (idempotent)
DO $$ BEGIN
  ALTER TYPE "AttachmentContext" ADD VALUE 'SIDE_EFFECT_REPORT_ATTACHMENT';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- AlterTable
ALTER TABLE "Attachment" ADD COLUMN IF NOT EXISTS "side_effect_report_id" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "side_effect_reports" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "severity" "SideEffectSeverity" NOT NULL,
    "description" TEXT NOT NULL,
    "status" "SideEffectStatus" NOT NULL DEFAULT 'PENDING',
    "service_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "side_effect_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "side_effect_reports_status_idx" ON "side_effect_reports"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "side_effect_reports_severity_idx" ON "side_effect_reports"("severity");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "side_effect_reports_createdAt_idx" ON "side_effect_reports"("createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Attachment_side_effect_report_id_idx" ON "Attachment"("side_effect_report_id");

-- AddForeignKey
ALTER TABLE "Attachment" DROP CONSTRAINT IF EXISTS "Attachment_side_effect_report_id_fkey";
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_side_effect_report_id_fkey" FOREIGN KEY ("side_effect_report_id") REFERENCES "side_effect_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "side_effect_reports" DROP CONSTRAINT IF EXISTS "side_effect_reports_service_id_fkey";
ALTER TABLE "side_effect_reports" ADD CONSTRAINT "side_effect_reports_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "side_effect_reports" DROP CONSTRAINT IF EXISTS "side_effect_reports_provider_id_fkey";
ALTER TABLE "side_effect_reports" ADD CONSTRAINT "side_effect_reports_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "DoctorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
