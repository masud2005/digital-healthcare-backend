-- Add `key` column to system_health with a unique constraint
-- First add the column as nullable to allow existing rows to get values
ALTER TABLE "system_health" ADD COLUMN IF NOT EXISTS "key" TEXT;

-- Backfill any existing rows using the id as a temporary unique key
UPDATE "system_health" SET "key" = "id" WHERE "key" IS NULL;

-- Now make the column NOT NULL and add unique constraint
ALTER TABLE "system_health" ALTER COLUMN "key" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "system_health_key_key" ON "system_health"("key");

-- Add system_health_logs table if not exists (was referenced in drift)
CREATE TABLE IF NOT EXISTS "system_health_logs" (
    "id" TEXT NOT NULL,
    "systemKey" TEXT NOT NULL,
    "status" "SystemHealthStatus" NOT NULL DEFAULT 'OPERATIONAL',
    "responseTimeMs" INTEGER,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_health_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "system_health_logs_systemKey_idx" ON "system_health_logs"("systemKey");
CREATE INDEX IF NOT EXISTS "system_health_logs_createdAt_idx" ON "system_health_logs"("createdAt");
