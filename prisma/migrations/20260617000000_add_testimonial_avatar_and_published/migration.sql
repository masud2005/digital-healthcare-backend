-- AlterTable
ALTER TABLE "testimonials" ADD COLUMN "avatar_id" TEXT,
ADD COLUMN "is_published" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "testimonials_avatar_id_key" ON "testimonials"("avatar_id");

-- AddForeignKey
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_avatar_id_fkey" FOREIGN KEY ("avatar_id") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
