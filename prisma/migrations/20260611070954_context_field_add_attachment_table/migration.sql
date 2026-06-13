/*
  Warnings:

  - Added the required column `context` to the `Attachment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Attachment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AttachmentContext" AS ENUM ('PROFILE_PICTURE', 'CHAT_MESSAGE', 'PRODUCT_IMAGE', 'ASSESSMENT_FILE', 'MEDICAL_REPORT');

-- AlterTable
ALTER TABLE "Attachment" ADD COLUMN     "context" "AttachmentContext" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "Attachment_context_idx" ON "Attachment"("context");

-- CreateIndex
CREATE INDEX "Attachment_uploadedById_context_idx" ON "Attachment"("uploadedById", "context");
