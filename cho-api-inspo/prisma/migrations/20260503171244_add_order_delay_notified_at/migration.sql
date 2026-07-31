-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "delay_notified_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "orders_status_delay_notified_at_idx" ON "orders"("status", "delay_notified_at");
