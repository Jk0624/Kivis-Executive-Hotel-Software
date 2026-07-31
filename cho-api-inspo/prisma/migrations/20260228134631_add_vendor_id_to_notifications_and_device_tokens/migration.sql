-- AlterTable
ALTER TABLE "device_tokens" ADD COLUMN     "vendor_id" BIGINT,
ALTER COLUMN "user_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "vendor_id" BIGINT;

-- CreateIndex
CREATE INDEX "device_tokens_vendor_id_idx" ON "device_tokens"("vendor_id");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_tokens" ADD CONSTRAINT "device_tokens_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
