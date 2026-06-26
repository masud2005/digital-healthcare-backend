/*
  Warnings:

  - You are about to drop the column `infoCard1Text` on the `EmailLayout` table. All the data in the column will be lost.
  - You are about to drop the column `infoCard1Title` on the `EmailLayout` table. All the data in the column will be lost.
  - You are about to drop the column `infoCard2Email` on the `EmailLayout` table. All the data in the column will be lost.
  - You are about to drop the column `infoCard2Text` on the `EmailLayout` table. All the data in the column will be lost.
  - You are about to drop the column `infoCard2Title` on the `EmailLayout` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[logoId]` on the table `EmailLayout` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "CommunicationAction" ADD VALUE 'ORDER_CONFIRMATION';
ALTER TYPE "CommunicationAction" ADD VALUE 'PAYMENT_RECEIPT';

-- AlterTable
ALTER TABLE "EmailLayout" DROP COLUMN "infoCard1Text",
DROP COLUMN "infoCard1Title",
DROP COLUMN "infoCard2Email",
DROP COLUMN "infoCard2Text",
DROP COLUMN "infoCard2Title",
ADD COLUMN     "isBlack" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "logoId" TEXT;

-- AlterTable
ALTER TABLE "MessageTemplate" ADD COLUMN     "infoCard1Text" TEXT,
ADD COLUMN     "infoCard1Title" TEXT,
ADD COLUMN     "infoCard2Text" TEXT,
ADD COLUMN     "infoCard2Title" TEXT,
ADD COLUMN     "showInfoCards" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "SmsTemplate" (
    "id" UUID NOT NULL,
    "action" "CommunicationAction" NOT NULL,
    "channel" "CommunicationChannel" NOT NULL DEFAULT 'SMS',
    "content" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmsTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SmsTemplate_action_key" ON "SmsTemplate"("action");

-- CreateIndex
CREATE UNIQUE INDEX "EmailLayout_logoId_key" ON "EmailLayout"("logoId");

-- AddForeignKey
ALTER TABLE "EmailLayout" ADD CONSTRAINT "EmailLayout_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "Attachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
