/*
  Warnings:

  - A unique constraint covering the columns `[subscriptionId]` on the table `subscriptions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_subscriptionId_key" ON "public"."subscriptions"("subscriptionId");
