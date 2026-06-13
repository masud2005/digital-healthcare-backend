/*
  Warnings:

  - A unique constraint covering the columns `[key]` on the table `system_health` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `key` to the `system_health` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "system_health" ADD COLUMN     "key" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "system_health_logs" (
    "id" TEXT NOT NULL,
    "systemKey" TEXT NOT NULL,
    "status" "SystemHealthStatus" NOT NULL DEFAULT 'OPERATIONAL',
    "responseTimeMs" INTEGER,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_health_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "system_health_logs_systemKey_idx" ON "system_health_logs"("systemKey");

-- CreateIndex
CREATE INDEX "system_health_logs_createdAt_idx" ON "system_health_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "system_health_key_key" ON "system_health"("key");
