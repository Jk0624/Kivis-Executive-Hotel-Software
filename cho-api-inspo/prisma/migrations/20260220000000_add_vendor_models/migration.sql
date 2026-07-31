-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "PayoutMethod" AS ENUM ('BANK', 'MOMO');

-- DropIndex
DROP INDEX "users_referral_code_key";

-- AlterTable
ALTER TABLE "restaurants" DROP COLUMN "closing_time",
DROP COLUMN "opening_time",
ADD COLUMN     "vendor_id" BIGINT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "referral_code";

-- CreateTable
CREATE TABLE "vendors" (
    "id" BIGSERIAL NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(20) NOT NULL,
    "password" VARCHAR(255),
    "gender" "Gender",
    "nationality" VARCHAR(100),
    "dob" DATE,
    "auth_provider" "AuthProvider" NOT NULL DEFAULT 'PHONE',
    "google_id" VARCHAR(255),
    "email_verified_at" TIMESTAMP(3),
    "phone_verified_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operating_hours" (
    "id" BIGSERIAL NOT NULL,
    "restaurant_id" BIGINT NOT NULL,
    "day" "DayOfWeek" NOT NULL,
    "opening_time" VARCHAR(10) NOT NULL,
    "closing_time" VARCHAR(10) NOT NULL,
    "is_closed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "operating_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_payment_details" (
    "id" BIGSERIAL NOT NULL,
    "vendor_id" BIGINT NOT NULL,
    "method" "PayoutMethod" NOT NULL DEFAULT 'MOMO',
    "bank_name" VARCHAR(100),
    "network" VARCHAR(50),
    "phone" VARCHAR(20),
    "account_name" VARCHAR(200) NOT NULL,
    "account_number" VARCHAR(50),
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_payment_details_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vendors_email_key" ON "vendors"("email");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_phone_key" ON "vendors"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_google_id_key" ON "vendors"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "operating_hours_restaurant_id_day_key" ON "operating_hours"("restaurant_id", "day");

-- CreateIndex
CREATE INDEX "restaurants_vendor_id_idx" ON "restaurants"("vendor_id");

-- AddForeignKey
ALTER TABLE "restaurants" ADD CONSTRAINT "restaurants_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operating_hours" ADD CONSTRAINT "operating_hours_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_payment_details" ADD CONSTRAINT "vendor_payment_details_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

