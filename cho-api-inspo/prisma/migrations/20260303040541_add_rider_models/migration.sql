-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('BIKE', 'MOTORCYCLE', 'CAR', 'BICYCLE');

-- AlterTable
ALTER TABLE "device_tokens" ADD COLUMN     "rider_id" BIGINT;

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "rider_id" BIGINT;

-- CreateTable
CREATE TABLE "riders" (
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
    "is_personal_info_complete" BOOLEAN NOT NULL DEFAULT false,
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "riders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rider_vehicle_info" (
    "id" BIGSERIAL NOT NULL,
    "rider_id" BIGINT NOT NULL,
    "id_front_url" VARCHAR(500),
    "id_back_url" VARCHAR(500),
    "vehicle_type" "VehicleType",
    "vehicle_brand" VARCHAR(100),
    "number_plate" VARCHAR(50),
    "is_info_complete" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rider_vehicle_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rider_payment_details" (
    "id" BIGSERIAL NOT NULL,
    "rider_id" BIGINT NOT NULL,
    "method" "PayoutMethod" NOT NULL DEFAULT 'MOMO',
    "bank_name" VARCHAR(100),
    "network" VARCHAR(50),
    "phone" VARCHAR(20),
    "account_name" VARCHAR(200) NOT NULL,
    "account_number" VARCHAR(50),
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rider_payment_details_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "riders_email_key" ON "riders"("email");

-- CreateIndex
CREATE UNIQUE INDEX "riders_phone_key" ON "riders"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "riders_google_id_key" ON "riders"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "rider_vehicle_info_rider_id_key" ON "rider_vehicle_info"("rider_id");

-- CreateIndex
CREATE INDEX "device_tokens_rider_id_idx" ON "device_tokens"("rider_id");

-- AddForeignKey
ALTER TABLE "rider_vehicle_info" ADD CONSTRAINT "rider_vehicle_info_rider_id_fkey" FOREIGN KEY ("rider_id") REFERENCES "riders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rider_payment_details" ADD CONSTRAINT "rider_payment_details_rider_id_fkey" FOREIGN KEY ("rider_id") REFERENCES "riders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_rider_id_fkey" FOREIGN KEY ("rider_id") REFERENCES "riders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_tokens" ADD CONSTRAINT "device_tokens_rider_id_fkey" FOREIGN KEY ("rider_id") REFERENCES "riders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
