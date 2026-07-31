-- CreateTable
CREATE TABLE "pay_for_me_links" (
    "id" BIGSERIAL NOT NULL,
    "order_id" BIGINT NOT NULL,
    "token" VARCHAR(64) NOT NULL,
    "payer_name" VARCHAR(200),
    "payer_email" VARCHAR(255),
    "payer_phone" VARCHAR(20),
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pay_for_me_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pay_for_me_links_order_id_key" ON "pay_for_me_links"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "pay_for_me_links_token_key" ON "pay_for_me_links"("token");

-- CreateIndex
CREATE INDEX "pay_for_me_links_token_idx" ON "pay_for_me_links"("token");

-- CreateIndex
CREATE INDEX "pay_for_me_links_order_id_idx" ON "pay_for_me_links"("order_id");

-- CreateIndex
CREATE INDEX "pay_for_me_links_expires_at_idx" ON "pay_for_me_links"("expires_at");

-- AddForeignKey
ALTER TABLE "pay_for_me_links" ADD CONSTRAINT "pay_for_me_links_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
