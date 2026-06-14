-- CreateEnum
CREATE TYPE "ProviderLicenseSource" AS ENUM ('PRIMARY', 'DEA', 'STATE_BOARD');

-- CreateEnum
CREATE TYPE "ProviderLicenseStatus" AS ENUM ('ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'PENDING');

-- CreateTable
CREATE TABLE "provider_licenses" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT,
    "doctorName" TEXT NOT NULL,
    "doctorEmail" TEXT,
    "avatarColor" TEXT,
    "npiNumber" TEXT,
    "deaNumber" TEXT,
    "licenseNumber" TEXT,
    "licenseType" TEXT,
    "licenseStates" JSONB,
    "licenseSource" "ProviderLicenseSource" NOT NULL DEFAULT 'PRIMARY',
    "licenseStatus" "ProviderLicenseStatus" NOT NULL DEFAULT 'ACTIVE',
    "licenseExpiresAt" TIMESTAMP(3),
    "insuranceProvider" TEXT,
    "insuranceStatus" "ProviderLicenseStatus" NOT NULL DEFAULT 'ACTIVE',
    "insuranceExpiresAt" TIMESTAMP(3),
    "notes" TEXT,
    "metadata" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_licenses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "provider_licenses_doctorId_idx" ON "provider_licenses"("doctorId");

-- CreateIndex
CREATE INDEX "provider_licenses_doctorName_idx" ON "provider_licenses"("doctorName");

-- CreateIndex
CREATE INDEX "provider_licenses_licenseStatus_idx" ON "provider_licenses"("licenseStatus");

-- CreateIndex
CREATE INDEX "provider_licenses_insuranceStatus_idx" ON "provider_licenses"("insuranceStatus");

-- CreateIndex
CREATE INDEX "provider_licenses_licenseExpiresAt_idx" ON "provider_licenses"("licenseExpiresAt");

-- CreateIndex
CREATE INDEX "provider_licenses_insuranceExpiresAt_idx" ON "provider_licenses"("insuranceExpiresAt");
