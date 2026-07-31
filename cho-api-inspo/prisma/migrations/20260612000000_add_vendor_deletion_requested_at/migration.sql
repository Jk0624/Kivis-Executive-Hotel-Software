ALTER TABLE "vendors" ADD COLUMN "deletion_requested_at" TIMESTAMP(3);

CREATE INDEX "vendors_is_active_deletion_requested_at_idx" ON "vendors"("is_active", "deletion_requested_at");
