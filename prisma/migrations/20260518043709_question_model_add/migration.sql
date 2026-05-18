-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "heading" TEXT,
    "media" TEXT,
    "questionText" TEXT,
    "description" TEXT,
    "contentAlignment" "Alignment" NOT NULL DEFAULT 'LEFT',
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "assessmentId" TEXT NOT NULL,
    "parentOptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionOption" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "placeholder" TEXT,
    "inputType" TEXT,
    "questionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Question_assessmentId_idx" ON "Question"("assessmentId");

-- CreateIndex
CREATE INDEX "Question_parentOptionId_idx" ON "Question"("parentOptionId");

-- CreateIndex
CREATE INDEX "QuestionOption_questionId_idx" ON "QuestionOption"("questionId");

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_parentOptionId_fkey" FOREIGN KEY ("parentOptionId") REFERENCES "QuestionOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionOption" ADD CONSTRAINT "QuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
