-- AlterTable
ALTER TABLE "AssessmentSubmission" ADD COLUMN "submissionCode" TEXT NOT NULL DEFAULT '';

-- Backfill existing rows with a unique 6-char code
UPDATE "AssessmentSubmission"
SET "submissionCode" = UPPER(SUBSTRING(MD5(RANDOM()::TEXT || id) FROM 1 FOR 6))
WHERE "submissionCode" = '';

-- CreateUniqueIndex
CREATE UNIQUE INDEX "AssessmentSubmission_submissionCode_key" ON "AssessmentSubmission"("submissionCode");

-- AlterTable: remove default now that backfill is done
ALTER TABLE "AssessmentSubmission" ALTER COLUMN "submissionCode" DROP DEFAULT;
