/*
  Warnings:

  - You are about to drop the column `city` on the `OfficeLocation` table. All the data in the column will be lost.
  - You are about to drop the column `facebookUrl` on the `OfficeLocation` table. All the data in the column will be lost.
  - You are about to drop the column `instagramUrl` on the `OfficeLocation` table. All the data in the column will be lost.
  - You are about to drop the column `linkedinUrl` on the `OfficeLocation` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `OfficeLocation` table. All the data in the column will be lost.
  - You are about to drop the column `twitterUrl` on the `OfficeLocation` table. All the data in the column will be lost.
  - You are about to drop the column `zipCode` on the `OfficeLocation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "OfficeLocation" DROP COLUMN "city",
DROP COLUMN "facebookUrl",
DROP COLUMN "instagramUrl",
DROP COLUMN "linkedinUrl",
DROP COLUMN "state",
DROP COLUMN "twitterUrl",
DROP COLUMN "zipCode";
