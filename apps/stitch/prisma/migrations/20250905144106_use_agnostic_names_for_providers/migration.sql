/*
  Warnings:

  - You are about to drop the column `stripeCustomerId` on the `SubscriptionEntitlement` table. All the data in the column will be lost.
  - You are about to drop the column `stripePriceId` on the `SubscriptionEntitlement` table. All the data in the column will be lost.
  - You are about to drop the column `stripeSubscriptionId` on the `SubscriptionEntitlement` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[paymentProviderSubscriptionId]` on the table `SubscriptionEntitlement` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."SubscriptionEntitlement_stripeCustomerId_idx";

-- DropIndex
DROP INDEX "public"."SubscriptionEntitlement_stripeSubscriptionId_key";

-- AlterTable
ALTER TABLE "public"."SubscriptionEntitlement" DROP COLUMN "stripeCustomerId",
DROP COLUMN "stripePriceId",
DROP COLUMN "stripeSubscriptionId",
ADD COLUMN     "paymentProviderCustomerId" TEXT,
ADD COLUMN     "paymentProviderPriceId" TEXT,
ADD COLUMN     "paymentProviderSubscriptionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionEntitlement_paymentProviderSubscriptionId_key" ON "public"."SubscriptionEntitlement"("paymentProviderSubscriptionId");

-- CreateIndex
CREATE INDEX "SubscriptionEntitlement_paymentProviderCustomerId_idx" ON "public"."SubscriptionEntitlement"("paymentProviderCustomerId");
