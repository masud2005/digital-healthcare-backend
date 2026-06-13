-- CreateEnum
CREATE TYPE "ConsentSource" AS ENUM ('WEB', 'MOBILE');

-- CreateEnum
CREATE TYPE "ConsentStatus" AS ENUM ('ACCEPTED', 'REVOKED', 'PENDING');

-- CreateEnum
CREATE TYPE "ConsentType" AS ENUM ('DATA_PROCESSING', 'MARKETING', 'ANALYTICS', 'AI_TRAINING');

-- CreateTable
CREATE TABLE "consents" (
    "id" TEXT NOT NULL,
    "userName" TEXT,
    "email" TEXT,
    "type" "ConsentType" NOT NULL,
    "status" "ConsentStatus" NOT NULL DEFAULT 'PENDING',
    "source" "ConsentSource" NOT NULL DEFAULT 'WEB',
    "userId" TEXT,
    "consentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "consents_email_idx" ON "consents"("email");

-- CreateIndex
CREATE INDEX "consents_status_idx" ON "consents"("status");

-- CreateIndex
CREATE INDEX "consents_type_idx" ON "consents"("type");
