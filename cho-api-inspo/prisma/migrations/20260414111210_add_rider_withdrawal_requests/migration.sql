-- CreateTable
CREATE TABLE "rider_withdrawal_requests" (
    "id" BIGSERIAL NOT NULL,
    "rider_id" BIGINT NOT NULL,
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

    CONSTRAINT "rider_withdrawal_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rider_withdrawal_requests_rider_id_idx" ON "rider_withdrawal_requests"("rider_id");

-- CreateIndex
CREATE INDEX "rider_withdrawal_requests_status_idx" ON "rider_withdrawal_requests"("status");

-- AddForeignKey
ALTER TABLE "rider_withdrawal_requests" ADD CONSTRAINT "rider_withdrawal_requests_rider_id_fkey" FOREIGN KEY ("rider_id") REFERENCES "riders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
