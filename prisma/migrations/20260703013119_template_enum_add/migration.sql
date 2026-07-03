-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "CommunicationAction" ADD VALUE 'ASSESSMENT_SUBMITTED';
ALTER TYPE "CommunicationAction" ADD VALUE 'WELCOME_PATIENT';
ALTER TYPE "CommunicationAction" ADD VALUE 'NEW_PATIENT_REGISTERED_ADMIN';
ALTER TYPE "CommunicationAction" ADD VALUE 'ASSESSMENT_APPROVED';
ALTER TYPE "CommunicationAction" ADD VALUE 'ASSESSMENT_REJECTED';
ALTER TYPE "CommunicationAction" ADD VALUE 'ASSESSMENT_REFILL_REQUEST';
ALTER TYPE "CommunicationAction" ADD VALUE 'ASSESSMENT_EDIT_SUBMITTED';
ALTER TYPE "CommunicationAction" ADD VALUE 'NEW_MESSAGE';
ALTER TYPE "CommunicationAction" ADD VALUE 'NEW_PROPOSAL';
ALTER TYPE "CommunicationAction" ADD VALUE 'PROPOSAL_ACCEPTED';
ALTER TYPE "CommunicationAction" ADD VALUE 'PROPOSAL_REJECTED';
ALTER TYPE "CommunicationAction" ADD VALUE 'SUBSCRIPTION_CANCELLED';
