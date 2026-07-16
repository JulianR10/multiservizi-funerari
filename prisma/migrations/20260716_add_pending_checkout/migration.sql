-- CreateTable
CREATE TABLE "PendingCheckout" (
    "id" TEXT NOT NULL,
    "guestEmail" TEXT NOT NULL,
    "userId" TEXT,
    "items" JSONB NOT NULL,
    "shippingMethodId" TEXT,
    "shippingAddress" JSONB,
    "billingAddress" JSONB,
    "consumed" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PendingCheckout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PendingCheckout_expiresAt_idx" ON "PendingCheckout"("expiresAt");

-- CreateIndex
CREATE INDEX "PendingCheckout_consumed_idx" ON "PendingCheckout"("consumed");
