CREATE TYPE "IncidentSeverity" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');

CREATE TYPE "IncidentSource" AS ENUM ('SECURITY_SCAN', 'SYSTEM_MONITORING', 'USER_REPORT', 'MANUAL');

CREATE TYPE "IncidentStatus" AS ENUM ('OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED');

CREATE TABLE "incidents" (
    "id" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" "IncidentSeverity" NOT NULL,
    "status" "IncidentStatus" NOT NULL DEFAULT 'OPEN',
    "source" "IncidentSource" NOT NULL DEFAULT 'MANUAL',
    "affectedSystem" TEXT,
    "reportedBy" TEXT,
    "assignedTo" TEXT,
    "description" TEXT,
    "responseSummary" TEXT,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "incidents_incidentId_key" ON "incidents"("incidentId");
CREATE INDEX "incidents_incidentId_idx" ON "incidents"("incidentId");
CREATE INDEX "incidents_severity_idx" ON "incidents"("severity");
CREATE INDEX "incidents_status_idx" ON "incidents"("status");
CREATE INDEX "incidents_detectedAt_idx" ON "incidents"("detectedAt");
