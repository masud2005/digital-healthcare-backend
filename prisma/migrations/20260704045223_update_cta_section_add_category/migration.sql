-- AlterTable
ALTER TABLE "cta_sections" ADD COLUMN     "categoryId" TEXT;

-- AddForeignKey
ALTER TABLE "cta_sections" ADD CONSTRAINT "cta_sections_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
