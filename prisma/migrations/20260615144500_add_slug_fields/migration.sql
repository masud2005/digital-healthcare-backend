-- DropIndex
DROP INDEX IF EXISTS "Category_name_key";

-- AlterTable
ALTER TABLE "Category" ADD COLUMN "slug" TEXT;
UPDATE "Category" SET "slug" = LOWER(REGEXP_REPLACE(name, '[^\w\s-]|_', '', 'g'));
UPDATE "Category" SET "slug" = REGEXP_REPLACE("slug", '\s+', '-', 'g');
UPDATE "Category" SET "slug" = 'temp-slug-' || substring(md5(random()::text) from 1 for 8) WHERE "slug" IS NULL OR "slug" = '';
ALTER TABLE "Category" ALTER COLUMN "slug" SET NOT NULL;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN "slug" TEXT;
UPDATE "Product" SET "slug" = LOWER(REGEXP_REPLACE(name, '[^\w\s-]|_', '', 'g'));
UPDATE "Product" SET "slug" = REGEXP_REPLACE("slug", '\s+', '-', 'g');
UPDATE "Product" SET "slug" = 'temp-slug-' || substring(md5(random()::text) from 1 for 8) WHERE "slug" IS NULL OR "slug" = '';
ALTER TABLE "Product" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "Product" ALTER COLUMN "price" DROP NOT NULL;
ALTER TABLE "Product" ALTER COLUMN "stockQuantity" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "stockQuantity" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
CREATE INDEX "Category_slug_idx" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
CREATE INDEX "Product_slug_idx" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "ProductVariant_productId_idx" ON "ProductVariant"("productId");
CREATE UNIQUE INDEX "ProductVariant_productId_size_key" ON "ProductVariant"("productId", "size");

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
