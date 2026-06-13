-- AlterEnum
ALTER TYPE "AttachmentContext" ADD VALUE 'CATEGORY_ICON';

-- DropForeignKey
ALTER TABLE "Assessment" DROP CONSTRAINT "Assessment_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_iconId_fkey";

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_iconId_fkey" FOREIGN KEY ("iconId") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
