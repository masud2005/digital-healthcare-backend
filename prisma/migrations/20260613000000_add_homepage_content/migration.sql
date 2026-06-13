-- CreateTable
CREATE TABLE "homepage_content" (
    "id" TEXT NOT NULL,
    "hero_image_url" TEXT,
    "hero_badge_image_url" TEXT,
    "hero_badge_text" TEXT,
    "hero_badge_link" TEXT,
    "hero_title" TEXT,
    "hero_description" TEXT,
    "hero_button_text" TEXT,
    "hero_button_link" TEXT,
    "hero_button_new_tab" BOOLEAN NOT NULL DEFAULT false,
    "banner_title" TEXT,
    "banner_description" TEXT,
    "about_subtitle" TEXT,
    "about_title" TEXT,
    "about_description" TEXT,
    "about_primary_button_text" TEXT,
    "about_primary_button_link" TEXT,
    "about_primary_button_new_tab" BOOLEAN NOT NULL DEFAULT false,
    "about_secondary_button_text" TEXT,
    "about_secondary_button_link" TEXT,
    "about_secondary_button_new_tab" BOOLEAN NOT NULL DEFAULT false,
    "about_bullets" TEXT[],
    "product_title" TEXT,
    "product_button_link" TEXT,
    "product_button_new_tab" BOOLEAN NOT NULL DEFAULT false,
    "how_it_works_title" TEXT,
    "testimonial_title" TEXT,
    "testimonial_subtitle" TEXT,
    "testimonial_description" TEXT,
    "testimonial_button_link" TEXT,
    "testimonial_button_new_tab" BOOLEAN NOT NULL DEFAULT false,
    "pricing_title" TEXT,
    "pricing_subtitle" TEXT,
    "pricing_description" TEXT,
    "pricing_button_link" TEXT,
    "pricing_button_new_tab" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "homepage_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "how_it_works_steps" (
    "id" TEXT NOT NULL,
    "homepage_content_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "icon_url" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "how_it_works_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homepage_faqs" (
    "id" TEXT NOT NULL,
    "homepage_content_id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "homepage_faqs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "how_it_works_steps" ADD CONSTRAINT "how_it_works_steps_homepage_content_id_fkey" FOREIGN KEY ("homepage_content_id") REFERENCES "homepage_content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homepage_faqs" ADD CONSTRAINT "homepage_faqs_homepage_content_id_fkey" FOREIGN KEY ("homepage_content_id") REFERENCES "homepage_content"("id") ON DELETE CASCADE ON UPDATE CASCADE;
