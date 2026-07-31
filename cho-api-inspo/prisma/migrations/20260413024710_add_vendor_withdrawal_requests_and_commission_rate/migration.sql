-- CreateEnum
CREATE TYPE "withdrawal_status" AS ENUM ('PENDING', 'APPROVED', 'PROCESSING', 'COMPLETED', 'REJECTED');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "vendor_commission_rate" DECIMAL(5,4) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "vendor_withdrawal_requests" (
    "id" BIGSERIAL NOT NULL,
    "restaurant_id" BIGINT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "withdrawal_status" NOT NULL DEFAULT 'PENDING',
    "method" VARCHAR(10) NOT NULL,
    "account_name" VARCHAR(200) NOT NULL,
    "account_number" VARCHAR(50),
    "bank_name" VARCHAR(100),
    "network" VARCHAR(50),
    "phone" VARCHAR(20),
    "admin_note" TEXT,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_withdrawal_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "vendor_withdrawal_requests_restaurant_id_idx" ON "vendor_withdrawal_requests"("restaurant_id");

-- CreateIndex
CREATE INDEX "vendor_withdrawal_requests_status_idx" ON "vendor_withdrawal_requests"("status");

-- AddForeignKey
ALTER TABLE "vendor_withdrawal_requests" ADD CONSTRAINT "vendor_withdrawal_requests_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
