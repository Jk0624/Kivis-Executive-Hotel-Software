-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "paid_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "orders_status_paid_at_idx" ON "orders"("status", "paid_at");

-- CreateIndex
CREATE INDEX "orders_status_created_at_idx" ON "orders"("status", "created_at");
