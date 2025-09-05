/*
  Warnings:

  - You are about to drop the column `stripeCustomerId` on the `Customer` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[paymentProviderCustomerId]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Customer_stripeCustomerId_idx";

-- DropIndex
DROP INDEX "public"."Customer_stripeCustomerId_key";

-- AlterTable
ALTER TABLE "public"."Customer" DROP COLUMN "stripeCustomerId",
ADD COLUMN     "paymentProviderCustomerId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Customer_paymentProviderCustomerId_key" ON "public"."Customer"("paymentProviderCustomerId");

-- CreateIndex
CREATE INDEX "Customer_paymentProviderCustomerId_idx" ON "public"."Customer"("paymentProviderCustomerId");
