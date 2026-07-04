-- CreateTable
CREATE TABLE "billing_cancellation" (
    "id" TEXT NOT NULL,
    "page" "PageType" NOT NULL DEFAULT 'BillingCancellation',
    "timelineTitle" TEXT NOT NULL,
    "timelineSteps" JSONB,
    "timelineDisclaimerTitle" TEXT NOT NULL,
    "timelineDisclaimerDescription" TEXT NOT NULL,
    "cancelTitle" TEXT NOT NULL,
    "cancelDescription" TEXT NOT NULL,
    "cancelSteps" JSONB,
    "refundEligibleTitle" TEXT NOT NULL,
    "refundEligibleConditions" JSONB,
    "refundNotEligibleTitle" TEXT NOT NULL,
    "refundNotEligibleConditions" JSONB,
    "faqTitle" TEXT NOT NULL,
    "faqs" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_cancellation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eligibility" (
    "id" TEXT NOT NULL,
    "generalTitle" TEXT NOT NULL,
    "generalPoints" JSONB,
    "generalBottomDesc" TEXT NOT NULL,
    "qualificationTitle" TEXT NOT NULL,
    "qualificationbmi27Text" TEXT NOT NULL,
    "qualification27Description" TEXT NOT NULL,
    "qualificationbmi30Text" TEXT NOT NULL,
    "qualification30Description" TEXT NOT NULL,
    "weightConditionSecTitle" TEXT NOT NULL,
    "weightConditions" JSONB,
    "contraindicationsSectionTitle" TEXT NOT NULL,
    "contraindicationsSectionWrite" JSONB,
    "requiredlabWorkSectionTitle" TEXT NOT NULL,
    "requiredlabWorkSectionContraindications" JSONB,
    "ongoingMonitoringSectionTitle" TEXT NOT NULL,
    "ongoingMonitoringSectionContraindication" JSONB,
    "disclaimerSectionTitle" TEXT NOT NULL,
    "disclaimerSectionDes" TEXT NOT NULL,
    "faqTitle" TEXT NOT NULL,
    "faqs" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "eligibility_pkey" PRIMARY KEY ("id")
);
