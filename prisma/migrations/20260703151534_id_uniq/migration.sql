/*
  Warnings:

  - The primary key for the `cta_sections` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "cta_sections" DROP CONSTRAINT "cta_sections_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "cta_sections_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "cta_sections_id_seq";
