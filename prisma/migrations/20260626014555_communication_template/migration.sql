-- CreateEnum
CREATE TYPE "CommunicationAction" AS ENUM ('OTP_LOGIN', 'OTP_REGISTER', 'OTP_FORGOT_PASSWORD', 'DOCTOR_CREDENTIALS', 'CONTACT_LEAD_REPLY');

-- CreateEnum
CREATE TYPE "CommunicationChannel" AS ENUM ('EMAIL', 'SMS');

-- CreateTable
CREATE TABLE "MessageTemplate" (
    "id" UUID NOT NULL,
    "action" "CommunicationAction" NOT NULL,
    "channel" "CommunicationChannel" NOT NULL DEFAULT 'EMAIL',
    "subject" TEXT,
    "headerTitle" TEXT,
    "headerSubtitle" TEXT,
    "content" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailLayout" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'DEFAULT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "brandName" TEXT NOT NULL DEFAULT 'WEIGHTLOSSMD',
    "headerTitle" TEXT NOT NULL DEFAULT 'System Notification',
    "headerSubtitle" TEXT NOT NULL DEFAULT 'We have an important update regarding your account.',
    "infoCard1Title" TEXT NOT NULL DEFAULT 'SECURE ACCESS',
    "infoCard1Text" TEXT NOT NULL DEFAULT 'This code helps us confirm it''s really you and protects your account from unauthorized access.',
    "infoCard2Title" TEXT NOT NULL DEFAULT 'NEED HELP?',
    "infoCard2Text" TEXT NOT NULL DEFAULT 'If you did not request this email, ignore it or contact our team at',
    "infoCard2Email" TEXT NOT NULL DEFAULT 'support@weightlossmd.com',
    "footerCompanyName" TEXT NOT NULL DEFAULT 'WeightLossMD Support',
    "footerEmail" TEXT NOT NULL DEFAULT 'support@weightlossmd.com',
    "footerTagline" TEXT NOT NULL DEFAULT 'This is an automated message. Please do not reply to this email.',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailLayout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MessageTemplate_action_key" ON "MessageTemplate"("action");

-- CreateIndex
CREATE UNIQUE INDEX "EmailLayout_name_key" ON "EmailLayout"("name");
