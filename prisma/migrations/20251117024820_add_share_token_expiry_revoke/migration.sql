-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "TradeDirection" AS ENUM ('SELL', 'BUY');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "walletAddress" TEXT NOT NULL,
    "nonce" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "direction" "TradeDirection" NOT NULL,
    "creatorId" INTEGER NOT NULL,
    "accepterId" INTEGER,
    "acceptedAt" TIMESTAMP(3),
    "escrowId" INTEGER,
    "escrowAddress" TEXT,
    "escrowStatus" TEXT,
    "escrowTxHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "shareToken" TEXT,
    "shareTokenExpiresAt" TIMESTAMP(3),
    "shareTokenRevoked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EscrowRecord" (
    "id" SERIAL NOT NULL,
    "escrowId" INTEGER NOT NULL,
    "orderId" INTEGER,
    "contractAddress" TEXT,
    "chain" TEXT,
    "assetType" TEXT,
    "tokenAddress" TEXT,
    "amount" DECIMAL(36,0),
    "creator" TEXT,
    "accepter" TEXT,
    "status" TEXT,
    "txHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fundedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "EscrowRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DisputeRecord" (
    "id" SERIAL NOT NULL,
    "disputeId" INTEGER NOT NULL,
    "escrowRecordId" INTEGER,
    "initiator" TEXT,
    "reason" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "winner" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "DisputeRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit" TEXT,
    "estimatedValue" DECIMAL(18,2),
    "currency" TEXT,
    "category" TEXT,
    "offeringOrderId" INTEGER,
    "requestingOrderId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");

-- CreateIndex
CREATE INDEX "User_walletAddress_idx" ON "User"("walletAddress");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Order_shareToken_key" ON "Order"("shareToken");

-- CreateIndex
CREATE INDEX "Order_creatorId_idx" ON "Order"("creatorId");

-- CreateIndex
CREATE INDEX "Order_accepterId_idx" ON "Order"("accepterId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_escrowId_idx" ON "Order"("escrowId");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX "Order_shareToken_idx" ON "Order"("shareToken");

-- CreateIndex
CREATE UNIQUE INDEX "EscrowRecord_escrowId_key" ON "EscrowRecord"("escrowId");

-- CreateIndex
CREATE INDEX "EscrowRecord_orderId_idx" ON "EscrowRecord"("orderId");

-- CreateIndex
CREATE INDEX "EscrowRecord_creator_idx" ON "EscrowRecord"("creator");

-- CreateIndex
CREATE INDEX "EscrowRecord_accepter_idx" ON "EscrowRecord"("accepter");

-- CreateIndex
CREATE INDEX "EscrowRecord_status_idx" ON "EscrowRecord"("status");

-- CreateIndex
CREATE UNIQUE INDEX "DisputeRecord_disputeId_key" ON "DisputeRecord"("disputeId");

-- CreateIndex
CREATE INDEX "DisputeRecord_escrowRecordId_idx" ON "DisputeRecord"("escrowRecordId");

-- CreateIndex
CREATE INDEX "DisputeRecord_initiator_idx" ON "DisputeRecord"("initiator");

-- CreateIndex
CREATE INDEX "OrderItem_offeringOrderId_idx" ON "OrderItem"("offeringOrderId");

-- CreateIndex
CREATE INDEX "OrderItem_requestingOrderId_idx" ON "OrderItem"("requestingOrderId");

-- CreateIndex
CREATE INDEX "OrderItem_category_idx" ON "OrderItem"("category");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_accepterId_fkey" FOREIGN KEY ("accepterId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_offeringOrderId_fkey" FOREIGN KEY ("offeringOrderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_requestingOrderId_fkey" FOREIGN KEY ("requestingOrderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
