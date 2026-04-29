-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "pendingPlan" TEXT,
ADD COLUMN     "stripeSubscriptionItemId" TEXT;
