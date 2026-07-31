ALTER TABLE "riders" ADD COLUMN "deletion_requested_at" TIMESTAMP(3);

CREATE INDEX "riders_is_active_deletion_requested_at_idx" ON "riders"("is_active", "deletion_requested_at");
