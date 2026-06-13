-- DropIndex
DROP INDEX IF EXISTS "ContactLead_email_key";

-- AlterTable
ALTER TABLE "ContactLead" ADD COLUMN IF NOT EXISTS "respondedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "responseAttachments" TEXT,
ADD COLUMN IF NOT EXISTS "responseMessage" TEXT,
ADD COLUMN IF NOT EXISTS "responseSubject" TEXT;
