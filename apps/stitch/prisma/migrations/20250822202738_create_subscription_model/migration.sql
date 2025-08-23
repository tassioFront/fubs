/*
  Warnings:

  - You are about to drop the `Order` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."SubscriptionStatus" AS ENUM ('trialing', 'active', 'past_due', 'canceled', 'unpaid', 'incomplete', 'incomplete_expired', 'paused');

-- CreateEnum
CREATE TYPE "public"."BillingPeriod" AS ENUM ('month', 'year');

-- DropTable
DROP TABLE "public"."Order";

-- DropEnum
DROP TYPE "public"."OrderStatus";

-- CreateTable
CREATE TABLE "public"."SubscriptionEntitlement" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "planType" "public"."PlanType" NOT NULL,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "status" "public"."SubscriptionStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionEntitlement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionEntitlement_stripeSubscriptionId_key" ON "public"."SubscriptionEntitlement"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "SubscriptionEntitlement_ownerId_idx" ON "public"."SubscriptionEntitlement"("ownerId");

-- CreateIndex
CREATE INDEX "SubscriptionEntitlement_stripeCustomerId_idx" ON "public"."SubscriptionEntitlement"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "SubscriptionEntitlement_status_expiresAt_idx" ON "public"."SubscriptionEntitlement"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "Outbox_processed_idx" ON "public"."Outbox"("processed");
