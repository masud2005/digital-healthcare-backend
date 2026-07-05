-- CreateEnum
CREATE TYPE "RequestRecordStatus" AS ENUM ('PENDING', 'REVIEWED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "RequestRecordType" AS ENUM ('MEDICAL_RECORDS', 'PRESCRIPTION_HISTORY', 'BILLING_RECORDS', 'ACCOUNT_DELETION');

-- CreateTable
CREATE TABLE "request_records" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "requestType" "RequestRecordType" NOT NULL,
    "additionalNotes" TEXT,
    "consent" BOOLEAN NOT NULL,
    "status" "RequestRecordStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "request_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "request_records_status_idx" ON "request_records"("status");

-- CreateIndex
CREATE INDEX "request_records_createdAt_idx" ON "request_records"("createdAt");
