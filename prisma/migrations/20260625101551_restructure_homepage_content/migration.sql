/*
  Warnings:

  - You are about to drop the column `about_bullets` on the `homepage_content` table. All the data in the column will be lost.
  - You are about to drop the column `about_primary_button_link` on the `homepage_content` table. All the data in the column will be lost.
  - You are about to drop the column `about_primary_button_new_tab` on the `homepage_content` table. All the data in the column will be lost.
  - You are about to drop the column `about_primary_button_text` on the `homepage_content` table. All the data in the column will be lost.
  - You are about to drop the column `about_secondary_button_link` on the `homepage_content` table. All the data in the column will be lost.
  - You are about to drop the column `about_secondary_button_new_tab` on the `homepage_content` table. All the data in the column will be lost.
  - You are about to drop the column `about_secondary_button_text` on the `homepage_content` table. All the data in the column will be lost.
  - You are about to drop the column `about_subtitle` on the `homepage_content` table. All the data in the column will be lost.
  - You are about to drop the column `banner_description` on the `homepage_content` table. All the data in the column will be lost.
  - You are about to drop the column `banner_title` on the `homepage_content` table. All the data in the column will be lost.
  - You are about to drop the column `hero_badge_link` on the `homepage_content` table. All the data in the column will be lost.
  - You are about to drop the column `hero_badge_text` on the `homepage_content` table. All the data in the column will be lost.
  - You are about to drop the column `hero_image_id` on the `homepage_content` table. All the data in the column will be lost.
  - You are about to drop the column `pricing_button_link` on the `homepage_content` table. All the data in the column will be lost.
  - You are about to drop the column `pricing_button_new_tab` on the `homepage_content` table. All the data in the column will be lost.
  - You are about to drop the column `pricing_description` on the `homepage_content` table. All the data in the column will be lost.
  - You are about to drop the column `pricing_subtitle` on the `homepage_content` table. All the data in the column will be lost.
  - You are about to drop the column `pricing_title` on the `homepage_content` table. All the data in the column will be lost.
  - You are about to drop the column `product_button_link` on the `homepage_content` table. All the data in the column will be lost.
  - You are about to drop the column `product_button_new_tab` on the `homepage_content` table. All the data in the column will be lost.
  - You are about to drop the column `product_title` on the `homepage_content` table. All the data in the column will be lost.
  - You are about to drop the column `testimonial_description` on the `homepage_content` table. All the data in the column will be lost.
  - You are about to drop the column `testimonial_subtitle` on the `homepage_content` table. All the data in the column will be lost.
  - You are about to drop the `homepage_faqs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `how_it_works_steps` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[hero_media_id]` on the table `homepage_content` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[about_media_id]` on the table `homepage_content` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[faq_card_media_id]` on the table `homepage_content` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "homepage_content" DROP CONSTRAINT "homepage_content_hero_image_id_fkey";

-- DropForeignKey
ALTER TABLE "homepage_faqs" DROP CONSTRAINT "homepage_faqs_homepage_content_id_fkey";

-- DropForeignKey
ALTER TABLE "how_it_works_steps" DROP CONSTRAINT "how_it_works_steps_homepage_content_id_fkey";

-- DropForeignKey
ALTER TABLE "how_it_works_steps" DROP CONSTRAINT "how_it_works_steps_icon_id_fkey";

-- DropIndex
DROP INDEX "homepage_content_hero_image_id_key";

-- AlterTable
ALTER TABLE "homepage_content" DROP COLUMN "about_bullets",
DROP COLUMN "about_primary_button_link",
DROP COLUMN "about_primary_button_new_tab",
DROP COLUMN "about_primary_button_text",
DROP COLUMN "about_secondary_button_link",
DROP COLUMN "about_secondary_button_new_tab",
DROP COLUMN "about_secondary_button_text",
DROP COLUMN "about_subtitle",
DROP COLUMN "banner_description",
DROP COLUMN "banner_title",
DROP COLUMN "hero_badge_link",
DROP COLUMN "hero_badge_text",
DROP COLUMN "hero_image_id",
DROP COLUMN "pricing_button_link",
DROP COLUMN "pricing_button_new_tab",
DROP COLUMN "pricing_description",
DROP COLUMN "pricing_subtitle",
DROP COLUMN "pricing_title",
DROP COLUMN "product_button_link",
DROP COLUMN "product_button_new_tab",
DROP COLUMN "product_title",
DROP COLUMN "testimonial_description",
DROP COLUMN "testimonial_subtitle",
ADD COLUMN     "about_button_link" TEXT,
ADD COLUMN     "about_button_new_tab" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "about_button_text" TEXT,
ADD COLUMN     "about_featured_service_1_id" TEXT,
ADD COLUMN     "about_featured_service_2_id" TEXT,
ADD COLUMN     "about_featured_service_3_id" TEXT,
ADD COLUMN     "about_media_id" TEXT,
ADD COLUMN     "assessment_description" TEXT,
ADD COLUMN     "assessment_title" TEXT,
ADD COLUMN     "faq_answer_1" TEXT,
ADD COLUMN     "faq_answer_2" TEXT,
ADD COLUMN     "faq_answer_3" TEXT,
ADD COLUMN     "faq_answer_4" TEXT,
ADD COLUMN     "faq_answer_5" TEXT,
ADD COLUMN     "faq_answer_6" TEXT,
ADD COLUMN     "faq_button_link" TEXT,
ADD COLUMN     "faq_button_new_tab" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "faq_button_text" TEXT,
ADD COLUMN     "faq_card_description" TEXT,
ADD COLUMN     "faq_card_media_id" TEXT,
ADD COLUMN     "faq_card_title" TEXT,
ADD COLUMN     "faq_question_1" TEXT,
ADD COLUMN     "faq_question_2" TEXT,
ADD COLUMN     "faq_question_3" TEXT,
ADD COLUMN     "faq_question_4" TEXT,
ADD COLUMN     "faq_question_5" TEXT,
ADD COLUMN     "faq_question_6" TEXT,
ADD COLUMN     "faq_title" TEXT,
ADD COLUMN     "hero_media_id" TEXT,
ADD COLUMN     "how_it_works_step_1_description" TEXT,
ADD COLUMN     "how_it_works_step_1_title" TEXT,
ADD COLUMN     "how_it_works_step_2_description" TEXT,
ADD COLUMN     "how_it_works_step_2_title" TEXT,
ADD COLUMN     "how_it_works_step_3_description" TEXT,
ADD COLUMN     "how_it_works_step_3_title" TEXT,
ADD COLUMN     "how_it_works_step_4_description" TEXT,
ADD COLUMN     "how_it_works_step_4_title" TEXT,
ADD COLUMN     "providers_button_link" TEXT,
ADD COLUMN     "providers_button_new_tab" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "providers_button_text" TEXT,
ADD COLUMN     "providers_title" TEXT,
ADD COLUMN     "testimonial_button_text" TEXT,
ADD COLUMN     "testimonial_card_description" TEXT,
ADD COLUMN     "testimonial_card_title" TEXT;

-- DropTable
DROP TABLE "homepage_faqs";

-- DropTable
DROP TABLE "how_it_works_steps";

-- CreateIndex
CREATE UNIQUE INDEX "homepage_content_hero_media_id_key" ON "homepage_content"("hero_media_id");

-- CreateIndex
CREATE UNIQUE INDEX "homepage_content_about_media_id_key" ON "homepage_content"("about_media_id");

-- CreateIndex
CREATE UNIQUE INDEX "homepage_content_faq_card_media_id_key" ON "homepage_content"("faq_card_media_id");

-- AddForeignKey
ALTER TABLE "homepage_content" ADD CONSTRAINT "homepage_content_hero_media_id_fkey" FOREIGN KEY ("hero_media_id") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homepage_content" ADD CONSTRAINT "homepage_content_about_featured_service_1_id_fkey" FOREIGN KEY ("about_featured_service_1_id") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homepage_content" ADD CONSTRAINT "homepage_content_about_featured_service_2_id_fkey" FOREIGN KEY ("about_featured_service_2_id") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homepage_content" ADD CONSTRAINT "homepage_content_about_featured_service_3_id_fkey" FOREIGN KEY ("about_featured_service_3_id") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homepage_content" ADD CONSTRAINT "homepage_content_about_media_id_fkey" FOREIGN KEY ("about_media_id") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homepage_content" ADD CONSTRAINT "homepage_content_faq_card_media_id_fkey" FOREIGN KEY ("faq_card_media_id") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
