-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "food_total" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "service_fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "tax" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "restaurants" ADD COLUMN     "platform_commission" DECIMAL(5,4) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "platform_config" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "service_fee_percent" DECIMAL(5,4) NOT NULL DEFAULT 0.0500,
    "service_fee_cap" DECIMAL(10,2) NOT NULL DEFAULT 5.00,
    "tax_rate" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "rider_delivery_fee_percent" DECIMAL(5,4) NOT NULL DEFAULT 0.7000,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_fee_tiers" (
    "id" SERIAL NOT NULL,
    "max_distance_km" DECIMAL(6,2) NOT NULL,
    "fee" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_fee_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "delivery_fee_tiers_max_distance_km_idx" ON "delivery_fee_tiers"("max_distance_km");
