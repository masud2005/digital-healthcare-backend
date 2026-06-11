CREATE TYPE "SystemHealthStatus" AS ENUM ('OPERATIONAL', 'DEGRADED', 'OUTAGE', 'MAINTENANCE');

CREATE TABLE "system_health" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "status" "SystemHealthStatus" NOT NULL DEFAULT 'OPERATIONAL',
    "description" TEXT,
    "message" TEXT,
    "responseTimeMs" INTEGER,
    "uptimePercent" DOUBLE PRECISION,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_health_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "system_health_category_idx" ON "system_health"("category");
CREATE INDEX "system_health_status_idx" ON "system_health"("status");
CREATE INDEX "system_health_checkedAt_idx" ON "system_health"("checkedAt");

CREATE TABLE "system_health_metrics" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT,
    "displayValue" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_health_metrics_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "system_health_metrics_key_key" ON "system_health_metrics"("key");
CREATE INDEX "system_health_metrics_recordedAt_idx" ON "system_health_metrics"("recordedAt");
