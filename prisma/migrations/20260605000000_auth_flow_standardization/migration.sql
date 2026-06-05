-- CreateEnum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserStatus') THEN
        CREATE TYPE "UserStatus" AS ENUM ('PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'DISABLED');
    END IF;
END $$;

-- CreateEnum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OtpChannel') THEN
        CREATE TYPE "OtpChannel" AS ENUM ('EMAIL', 'PHONE');
    END IF;
END $$;

-- CreateEnum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OtpStatus') THEN
        CREATE TYPE "OtpStatus" AS ENUM ('PENDING', 'VERIFIED', 'EXPIRED', 'CANCELLED', 'FAILED');
    END IF;
END $$;

-- CreateEnum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AuthAttemptStatus') THEN
        CREATE TYPE "AuthAttemptStatus" AS ENUM ('STARTED', 'OTP_SENT', 'VERIFIED', 'FAILED', 'EXPIRED', 'CANCELLED');
    END IF;
END $$;

-- CreateEnum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AuthSecurityEventType') THEN
        CREATE TYPE "AuthSecurityEventType" AS ENUM ('REGISTER_STARTED', 'LOGIN_STARTED', 'OTP_SENT', 'OTP_RESENT', 'OTP_VERIFY_FAILED', 'OTP_VERIFIED', 'SESSION_CREATED', 'SESSION_REVOKED', 'DEVICE_TRUSTED', 'DEVICE_REVOKED');
    END IF;
END $$;

-- AlterEnum
ALTER TYPE "OtpPurpose" ADD VALUE IF NOT EXISTS 'FORGOT_PASSWORD';

-- DropIndex
DROP INDEX IF EXISTS "AuthOtpChallenge_email_idx";

-- DropIndex
DROP INDEX IF EXISTS "AuthOtpChallenge_purpose_idx";

-- DropIndex
DROP INDEX IF EXISTS "User_role_categoryId_idx";

-- DropEnum
DROP TYPE IF EXISTS "Role";

-- AlterTable
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'phoneNumber'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'phone'
    ) THEN
        ALTER TABLE "User" RENAME COLUMN "phoneNumber" TO "phone";
    END IF;
END $$;

-- AlterTable
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'passwordHash'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'password'
    ) THEN
        ALTER TABLE "User" RENAME COLUMN "passwordHash" TO "password";
    END IF;
END $$;

-- AlterTable
ALTER TABLE "User"
    ADD COLUMN IF NOT EXISTS "phoneVerifiedAt" TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS "mfaEnabled" BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3),
    ALTER COLUMN "name" DROP NOT NULL,
    ALTER COLUMN "status" DROP DEFAULT;

-- AlterTable
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'User'
        AND column_name = 'status'
        AND udt_name <> 'UserStatus'
    ) THEN
        ALTER TABLE "User" ALTER COLUMN "status" TYPE "UserStatus" USING (
        CASE
            WHEN "status" = 'PENDING' THEN 'PENDING_VERIFICATION'
            ELSE "status"
        END
        )::"UserStatus";
    END IF;
END $$;

-- AlterTable
ALTER TABLE "User"
    ALTER COLUMN "status" SET DEFAULT 'PENDING_VERIFICATION';

-- AlterTable
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns WHERE table_name = 'AuthOtpChallenge' AND column_name = 'email'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns WHERE table_name = 'AuthOtpChallenge' AND column_name = 'recipient'
    ) THEN
        ALTER TABLE "AuthOtpChallenge" RENAME COLUMN "email" TO "recipient";
    END IF;
END $$;

-- AlterTable
ALTER TABLE "AuthOtpChallenge"
    ADD COLUMN IF NOT EXISTS "channel" "OtpChannel" NOT NULL DEFAULT 'EMAIL',
    ADD COLUMN IF NOT EXISTS "status" "OtpStatus" NOT NULL DEFAULT 'PENDING',
    ADD COLUMN IF NOT EXISTS "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS "lastSentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS "resendCount" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    ADD COLUMN IF NOT EXISTS "ipAddress" TEXT,
    ADD COLUMN IF NOT EXISTS "userAgent" TEXT,
    ADD COLUMN IF NOT EXISTS "flowAttemptId" TEXT;

-- AlterTable
ALTER TABLE "AuthSession"
    ADD COLUMN IF NOT EXISTS "refreshTokenHash" TEXT,
    ADD COLUMN IF NOT EXISTS "ipAddress" TEXT,
    ADD COLUMN IF NOT EXISTS "userAgent" TEXT,
    ADD COLUMN IF NOT EXISTS "deviceFingerprint" TEXT,
    ADD COLUMN IF NOT EXISTS "lastUsedAt" TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS "revokeReason" TEXT,
    ADD COLUMN IF NOT EXISTS "deviceId" TEXT,
    ADD COLUMN IF NOT EXISTS "flowAttemptId" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "AuthFlowAttempt" (
    "id" TEXT NOT NULL,
    "purpose" "OtpPurpose" NOT NULL,
    "status" "AuthAttemptStatus" NOT NULL DEFAULT 'STARTED',
    "otpChannel" "OtpChannel",
    "email" TEXT,
    "phone" TEXT,
    "passwordHash" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "acceptLanguage" TEXT,
    "deviceFingerprint" TEXT,
    "deviceName" TEXT,
    "country" TEXT,
    "city" TEXT,
    "failureReason" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "AuthFlowAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "AuthDevice" (
    "id" TEXT NOT NULL,
    "fingerprintHash" TEXT NOT NULL,
    "name" TEXT,
    "userAgent" TEXT,
    "platform" TEXT,
    "ipFirstSeen" TEXT,
    "ipLastSeen" TEXT,
    "country" TEXT,
    "city" TEXT,
    "trustedAt" TIMESTAMP(3),
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "AuthSecurityEvent" (
    "id" TEXT NOT NULL,
    "type" "AuthSecurityEventType" NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "deviceFingerprint" TEXT,
    "metadata" JSONB,
    "userId" TEXT,
    "flowAttemptId" TEXT,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthSecurityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "UserRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "assignedBy" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Permission" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "RolePermission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- BackfillRoles
INSERT INTO "Role" ("id", "name", "displayName", "isSystem")
SELECT *
FROM (VALUES
    ('role_admin', 'ADMIN', 'Admin', true),
    ('role_doctor', 'DOCTOR', 'Doctor', true),
    ('role_patient', 'PATIENT', 'Patient', true)
) AS seed("id", "name", "displayName", "isSystem")
WHERE NOT EXISTS (
    SELECT 1
    FROM "Role"
    WHERE "Role"."name" = seed."name"
);

INSERT INTO "Role" ("id", "name", "displayName", "isSystem")
SELECT DISTINCT 'role_' || md5("role"), "role", initcap(lower(replace("role", '_', ' '))), false
FROM "User"
WHERE "role" IS NOT NULL
AND NOT EXISTS (
    SELECT 1
    FROM "Role"
    WHERE "Role"."name" = "User"."role"
);

INSERT INTO "UserRole" ("id", "userId", "roleId")
SELECT "User"."id" || ':' || "Role"."id", "User"."id", "Role"."id"
FROM "User"
JOIN "Role" ON "Role"."name" = "User"."role"
WHERE "User"."role" IS NOT NULL
AND NOT EXISTS (
    SELECT 1
    FROM "UserRole"
    WHERE "UserRole"."userId" = "User"."id"
    AND "UserRole"."roleId" = "Role"."id"
);

-- AlterTable
ALTER TABLE "User" DROP COLUMN IF EXISTS "role";

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "User_categoryId_idx" ON "User"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Role_name_idx" ON "Role"("name");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Role_isActive_idx" ON "Role"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "UserRole_userId_roleId_key" ON "UserRole"("userId", "roleId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "UserRole_userId_idx" ON "UserRole"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "UserRole_roleId_idx" ON "UserRole"("roleId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "UserRole_expiresAt_idx" ON "UserRole"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Permission_key_key" ON "Permission"("key");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Permission_key_idx" ON "Permission"("key");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "RolePermission_roleId_permissionId_key" ON "RolePermission"("roleId", "permissionId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "RolePermission_roleId_idx" ON "RolePermission"("roleId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "RolePermission_permissionId_idx" ON "RolePermission"("permissionId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AuthFlowAttempt_email_idx" ON "AuthFlowAttempt"("email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AuthFlowAttempt_phone_idx" ON "AuthFlowAttempt"("phone");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AuthFlowAttempt_purpose_status_idx" ON "AuthFlowAttempt"("purpose", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AuthFlowAttempt_userId_idx" ON "AuthFlowAttempt"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AuthFlowAttempt_deviceFingerprint_idx" ON "AuthFlowAttempt"("deviceFingerprint");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AuthFlowAttempt_ipAddress_idx" ON "AuthFlowAttempt"("ipAddress");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AuthFlowAttempt_expiresAt_idx" ON "AuthFlowAttempt"("expiresAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AuthOtpChallenge_recipient_idx" ON "AuthOtpChallenge"("recipient");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AuthOtpChallenge_purpose_channel_status_idx" ON "AuthOtpChallenge"("purpose", "channel", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AuthOtpChallenge_flowAttemptId_idx" ON "AuthOtpChallenge"("flowAttemptId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "AuthDevice_userId_fingerprintHash_key" ON "AuthDevice"("userId", "fingerprintHash");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AuthDevice_userId_idx" ON "AuthDevice"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AuthDevice_fingerprintHash_idx" ON "AuthDevice"("fingerprintHash");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AuthDevice_lastSeenAt_idx" ON "AuthDevice"("lastSeenAt");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "AuthSession_refreshTokenHash_key" ON "AuthSession"("refreshTokenHash");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "AuthSession_flowAttemptId_key" ON "AuthSession"("flowAttemptId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AuthSession_deviceId_idx" ON "AuthSession"("deviceId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AuthSession_revokedAt_idx" ON "AuthSession"("revokedAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AuthSecurityEvent_type_idx" ON "AuthSecurityEvent"("type");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AuthSecurityEvent_userId_idx" ON "AuthSecurityEvent"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AuthSecurityEvent_flowAttemptId_idx" ON "AuthSecurityEvent"("flowAttemptId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AuthSecurityEvent_sessionId_idx" ON "AuthSecurityEvent"("sessionId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AuthSecurityEvent_ipAddress_idx" ON "AuthSecurityEvent"("ipAddress");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AuthSecurityEvent_deviceFingerprint_idx" ON "AuthSecurityEvent"("deviceFingerprint");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AuthSecurityEvent_createdAt_idx" ON "AuthSecurityEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "AuthFlowAttempt" ADD CONSTRAINT "AuthFlowAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthOtpChallenge" ADD CONSTRAINT "AuthOtpChallenge_flowAttemptId_fkey" FOREIGN KEY ("flowAttemptId") REFERENCES "AuthFlowAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthDevice" ADD CONSTRAINT "AuthDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthSession" ADD CONSTRAINT "AuthSession_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "AuthDevice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthSession" ADD CONSTRAINT "AuthSession_flowAttemptId_fkey" FOREIGN KEY ("flowAttemptId") REFERENCES "AuthFlowAttempt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthSecurityEvent" ADD CONSTRAINT "AuthSecurityEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthSecurityEvent" ADD CONSTRAINT "AuthSecurityEvent_flowAttemptId_fkey" FOREIGN KEY ("flowAttemptId") REFERENCES "AuthFlowAttempt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthSecurityEvent" ADD CONSTRAINT "AuthSecurityEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AuthSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
