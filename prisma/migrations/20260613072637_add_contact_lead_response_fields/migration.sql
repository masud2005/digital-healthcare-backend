-- DropIndex
DROP INDEX "ContactLead_email_key";

-- AlterTable
ALTER TABLE "ContactLead" ADD COLUMN     "respondedAt" TIMESTAMP(3),
ADD COLUMN     "responseAttachments" TEXT,
ADD COLUMN     "responseMessage" TEXT,
ADD COLUMN     "responseSubject" TEXT;


