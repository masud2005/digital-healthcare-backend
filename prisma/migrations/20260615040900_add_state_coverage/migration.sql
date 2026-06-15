-- CreateTable
CREATE TABLE "public"."_StateAllowedCategories" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_StateAllowedCategories_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."state_coverages" (
    "id" TEXT NOT NULL,
    "stateCode" TEXT NOT NULL,
    "stateName" TEXT NOT NULL,
    "status" "public"."StateComplianceStatus" NOT NULL DEFAULT 'COMPLIANT',
    "isComingSoon" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "state_coverages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "_StateAllowedCategories_B_index" ON "public"."_StateAllowedCategories"("B" ASC);

-- CreateIndex
CREATE INDEX "state_coverages_stateCode_idx" ON "public"."state_coverages"("stateCode" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "state_coverages_stateCode_key" ON "public"."state_coverages"("stateCode" ASC);

-- CreateIndex
CREATE INDEX "state_coverages_status_idx" ON "public"."state_coverages"("status" ASC);

-- AddForeignKey
ALTER TABLE "public"."_StateAllowedCategories" ADD CONSTRAINT "_StateAllowedCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_StateAllowedCategories" ADD CONSTRAINT "_StateAllowedCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."state_coverages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
