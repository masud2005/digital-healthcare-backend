/*
  Warnings:

  - The values [SIX_MONTHS] on the enum `BillingCycle` will be removed. If these variants are still used in the database, this will fail.
  - The values [REFUNDED] on the enum `SubscriptionStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `licenseNumber` on the `DoctorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `npiNumber` on the `DoctorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `yearsOfExperience` on the `DoctorProfile` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BillingCycle_new" AS ENUM ('MONTHLY', 'YEARLY', 'QUARTERLY');
ALTER TABLE "public"."PaymentPlan" ALTER COLUMN "billingCycle" DROP DEFAULT;
ALTER TABLE "PaymentPlan" ALTER COLUMN "billingCycle" TYPE "BillingCycle_new" USING ("billingCycle"::text::"BillingCycle_new");
ALTER TYPE "BillingCycle" RENAME TO "BillingCycle_old";
ALTER TYPE "BillingCycle_new" RENAME TO "BillingCycle";
DROP TYPE "public"."BillingCycle_old";
ALTER TABLE "PaymentPlan" ALTER COLUMN "billingCycle" SET DEFAULT 'MONTHLY';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "SubscriptionStatus_new" AS ENUM ('ACTIVE', 'CANCELLED', 'EXPIRED', 'PAST_DUE', 'TRIALING');
ALTER TABLE "public"."subscriptions" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "subscriptions" ALTER COLUMN "status" TYPE "SubscriptionStatus_new" USING ("status"::text::"SubscriptionStatus_new");
ALTER TYPE "SubscriptionStatus" RENAME TO "SubscriptionStatus_old";
ALTER TYPE "SubscriptionStatus_new" RENAME TO "SubscriptionStatus";
DROP TYPE "public"."SubscriptionStatus_old";
ALTER TABLE "subscriptions" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterTable
ALTER TABLE "DoctorProfile" DROP COLUMN "licenseNumber",
DROP COLUMN "npiNumber",
DROP COLUMN "yearsOfExperience";

-- CreateTable
CREATE TABLE "AdminProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar_id" TEXT,
    "title" TEXT,
    "specialty" TEXT,
    "bio" TEXT,
    "officeLocation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminProfile_userId_key" ON "AdminProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminProfile_avatar_id_key" ON "AdminProfile"("avatar_id");

-- CreateIndex
CREATE INDEX "AdminProfile_name_idx" ON "AdminProfile"("name");

-- CreateIndex
CREATE INDEX "AdminProfile_userId_idx" ON "AdminProfile"("userId");

-- AddForeignKey
ALTER TABLE "AdminProfile" ADD CONSTRAINT "AdminProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminProfile" ADD CONSTRAINT "AdminProfile_avatar_id_fkey" FOREIGN KEY ("avatar_id") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
