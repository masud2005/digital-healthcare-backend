-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "submissionId" TEXT;

-- CreateIndex
CREATE INDEX "orders_submissionId_idx" ON "orders"("submissionId");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "AssessmentSubmission"("id") ON DELETE SET NULL ON UPDATE CASCADE;
