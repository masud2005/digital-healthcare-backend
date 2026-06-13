-- DropIndex
DROP INDEX "ContactLead_email_key";

-- AlterTable
ALTER TABLE "ContactLead" ADD COLUMN     "respondedAt" TIMESTAMP(3),
ADD COLUMN     "responseAttachments" TEXT,
ADD COLUMN     "responseMessage" TEXT,
ADD COLUMN     "responseSubject" TEXT;

-- CreateTable
CREATE TABLE "DoctorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "title" TEXT,
    "specialty" TEXT,
    "bio" TEXT,
    "licenseNumber" TEXT,
    "npiNumber" TEXT,
    "yearsOfExperience" INTEGER,
    "officeLocation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "DoctorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DoctorProfile_userId_key" ON "DoctorProfile"("userId");

-- CreateIndex
CREATE INDEX "DoctorProfile_name_idx" ON "DoctorProfile"("name");

-- CreateIndex
CREATE INDEX "DoctorProfile_userId_idx" ON "DoctorProfile"("userId");

-- CreateIndex
CREATE INDEX "DoctorProfile_title_idx" ON "DoctorProfile"("title");

-- AddForeignKey
ALTER TABLE "DoctorProfile" ADD CONSTRAINT "DoctorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
