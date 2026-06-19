-- CreateEnum
CREATE TYPE "PaymentItemType" AS ENUM ('FEES', 'PRODUCT');

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "brand" TEXT,
ADD COLUMN     "last4" TEXT,
ADD COLUMN     "paymentType" "PaymentItemType"[];
