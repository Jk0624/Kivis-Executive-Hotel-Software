-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."AddonTag" AS ENUM ('main', 'sauce', 'sides', 'packaging');

-- CreateEnum
CREATE TYPE "public"."AuthProvider" AS ENUM ('PHONE', 'EMAIL', 'GOOGLE');

-- CreateEnum
CREATE TYPE "public"."CodeType" AS ENUM ('ACTIVATION', 'RESET', 'LOGIN');

-- CreateEnum
CREATE TYPE "public"."FrontendComponent" AS ENUM ('checkbox', 'slider', 'counter');

-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."PaymentType" AS ENUM ('MOMO', 'CARD');

-- CreateEnum
CREATE TYPE "public"."RestaurantStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'CLOSED', 'PENDING');

-- CreateEnum
CREATE TYPE "public"."TransactionStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "public"."addons" (
    "id" BIGSERIAL NOT NULL,
    "restaurant_id" BIGINT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "tag" "public"."AddonTag" NOT NULL DEFAULT 'packaging',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "step" DECIMAL(10,2),
    "min_price" DECIMAL(10,2),
    "max_price" DECIMAL(10,2),
    "frontend_component" "public"."FrontendComponent" NOT NULL DEFAULT 'counter',

    CONSTRAINT "addons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."categories" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "image_url" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."device_tokens" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "push_token" VARCHAR(255) NOT NULL,
    "platform" VARCHAR(20) NOT NULL,

    CONSTRAINT "device_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."favorite_foods" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "food_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_foods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."food_addons" (
    "id" BIGSERIAL NOT NULL,
    "food_id" BIGINT NOT NULL,
    "addon_id" BIGINT NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "max_quantity" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "food_addons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."food_packs" (
    "id" BIGSERIAL NOT NULL,
    "food_id" BIGINT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "food_packs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."foods" (
    "id" BIGSERIAL NOT NULL,
    "restaurant_id" BIGINT NOT NULL,
    "category_id" BIGINT,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "image_url" VARCHAR(500),
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "is_popular" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "requiredAddonTags" "public"."AddonTag"[] DEFAULT ARRAY[]::"public"."AddonTag"[],

    CONSTRAINT "foods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notifications" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT,
    "title" VARCHAR(150) NOT NULL,
    "message" TEXT NOT NULL,
    "type" VARCHAR(50) NOT NULL DEFAULT 'general',
    "metadata" JSONB,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."order_item_addons" (
    "id" BIGSERIAL NOT NULL,
    "order_item_id" BIGINT NOT NULL,
    "addon_id" BIGINT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_item_addons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."order_items" (
    "id" BIGSERIAL NOT NULL,
    "order_id" BIGINT NOT NULL,
    "food_id" BIGINT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "food_pack_id" BIGINT,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."orders" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "restaurant_id" BIGINT NOT NULL,
    "status" "public"."OrderStatus" NOT NULL DEFAULT 'PENDING',
    "total_amount" DECIMAL(10,2) NOT NULL,
    "delivery_address" TEXT NOT NULL,
    "delivery_fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "payment_method_id" BIGINT,
    "payment_status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payment_methods" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "type" "public"."PaymentType" NOT NULL DEFAULT 'MOMO',
    "provider" VARCHAR(50) NOT NULL,
    "account_identifier" VARCHAR(100) NOT NULL,
    "gateway_token" VARCHAR(255),
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."restaurants" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "phone" VARCHAR(20),
    "email" VARCHAR(255),
    "address_line" TEXT NOT NULL,
    "latitude" DECIMAL(10,8) NOT NULL,
    "longitude" DECIMAL(11,8) NOT NULL,
    "image_url" VARCHAR(500),
    "rating" DECIMAL(3,2) DEFAULT 0,
    "status" "public"."RestaurantStatus" NOT NULL DEFAULT 'ACTIVE',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_popular" BOOLEAN NOT NULL DEFAULT false,
    "opening_time" VARCHAR(10),
    "closing_time" VARCHAR(10),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."search_history" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "search_term" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."transactions" (
    "id" BIGSERIAL NOT NULL,
    "order_id" BIGINT NOT NULL,
    "paystack_reference" VARCHAR(255) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'GHS',
    "status" "public"."TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "paystack_response" JSONB,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_addresses" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "label" VARCHAR(50) DEFAULT 'Home',
    "address_line" TEXT NOT NULL,
    "latitude" DECIMAL(10,8) NOT NULL,
    "longitude" DECIMAL(11,8) NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" BIGSERIAL NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(20) NOT NULL,
    "password" VARCHAR(255),
    "gender" "public"."Gender",
    "dob" DATE,
    "auth_provider" "public"."AuthProvider" NOT NULL DEFAULT 'PHONE',
    "email_verified_at" TIMESTAMP(3),
    "phone_verified_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "referral_code" VARCHAR(50),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."verification_attempts" (
    "id" BIGSERIAL NOT NULL,
    "identifier" VARCHAR(255) NOT NULL,
    "ip_address" VARCHAR(45) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "last_attempt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."verification_codes" (
    "id" BIGSERIAL NOT NULL,
    "identifier" VARCHAR(255) NOT NULL,
    "code" VARCHAR(6) NOT NULL,
    "type" "public"."CodeType" NOT NULL DEFAULT 'ACTIVATION',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "addons_restaurant_id_idx" ON "public"."addons"("restaurant_id" ASC);

-- CreateIndex
CREATE INDEX "addons_restaurant_id_is_active_idx" ON "public"."addons"("restaurant_id" ASC, "is_active" ASC);

-- CreateIndex
CREATE INDEX "addons_tag_idx" ON "public"."addons"("tag" ASC);

-- CreateIndex
CREATE INDEX "categories_is_active_idx" ON "public"."categories"("is_active" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "public"."categories"("name" ASC);

-- CreateIndex
CREATE INDEX "categories_slug_idx" ON "public"."categories"("slug" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "public"."categories"("slug" ASC);

-- CreateIndex
CREATE INDEX "device_tokens_user_id_idx" ON "public"."device_tokens"("user_id" ASC);

-- CreateIndex
CREATE INDEX "favorite_foods_food_id_idx" ON "public"."favorite_foods"("food_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "favorite_foods_user_id_food_id_key" ON "public"."favorite_foods"("user_id" ASC, "food_id" ASC);

-- CreateIndex
CREATE INDEX "favorite_foods_user_id_idx" ON "public"."favorite_foods"("user_id" ASC);

-- CreateIndex
CREATE INDEX "food_addons_addon_id_idx" ON "public"."food_addons"("addon_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "food_addons_food_id_addon_id_key" ON "public"."food_addons"("food_id" ASC, "addon_id" ASC);

-- CreateIndex
CREATE INDEX "food_addons_food_id_idx" ON "public"."food_addons"("food_id" ASC);

-- CreateIndex
CREATE INDEX "food_packs_food_id_idx" ON "public"."food_packs"("food_id" ASC);

-- CreateIndex
CREATE INDEX "food_packs_food_id_is_active_idx" ON "public"."food_packs"("food_id" ASC, "is_active" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "food_packs_food_id_name_key" ON "public"."food_packs"("food_id" ASC, "name" ASC);

-- CreateIndex
CREATE INDEX "foods_category_id_idx" ON "public"."foods"("category_id" ASC);

-- CreateIndex
CREATE INDEX "foods_is_available_idx" ON "public"."foods"("is_available" ASC);

-- CreateIndex
CREATE INDEX "foods_is_popular_idx" ON "public"."foods"("is_popular" ASC);

-- CreateIndex
CREATE INDEX "foods_restaurant_id_idx" ON "public"."foods"("restaurant_id" ASC);

-- CreateIndex
CREATE INDEX "order_item_addons_addon_id_idx" ON "public"."order_item_addons"("addon_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "order_item_addons_order_item_id_addon_id_key" ON "public"."order_item_addons"("order_item_id" ASC, "addon_id" ASC);

-- CreateIndex
CREATE INDEX "order_item_addons_order_item_id_idx" ON "public"."order_item_addons"("order_item_id" ASC);

-- CreateIndex
CREATE INDEX "order_items_food_id_idx" ON "public"."order_items"("food_id" ASC);

-- CreateIndex
CREATE INDEX "order_items_food_pack_id_idx" ON "public"."order_items"("food_pack_id" ASC);

-- CreateIndex
CREATE INDEX "order_items_order_id_idx" ON "public"."order_items"("order_id" ASC);

-- CreateIndex
CREATE INDEX "orders_restaurant_id_idx" ON "public"."orders"("restaurant_id" ASC);

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "public"."orders"("status" ASC);

-- CreateIndex
CREATE INDEX "orders_user_id_idx" ON "public"."orders"("user_id" ASC);

-- CreateIndex
CREATE INDEX "orders_user_id_status_idx" ON "public"."orders"("user_id" ASC, "status" ASC);

-- CreateIndex
CREATE INDEX "restaurants_is_active_idx" ON "public"."restaurants"("is_active" ASC);

-- CreateIndex
CREATE INDEX "restaurants_is_popular_idx" ON "public"."restaurants"("is_popular" ASC);

-- CreateIndex
CREATE INDEX "restaurants_status_idx" ON "public"."restaurants"("status" ASC);

-- CreateIndex
CREATE INDEX "transactions_order_id_idx" ON "public"."transactions"("order_id" ASC);

-- CreateIndex
CREATE INDEX "transactions_paystack_reference_idx" ON "public"."transactions"("paystack_reference" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "transactions_paystack_reference_key" ON "public"."transactions"("paystack_reference" ASC);

-- CreateIndex
CREATE INDEX "transactions_status_idx" ON "public"."transactions"("status" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "public"."users"("phone" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "users_referral_code_key" ON "public"."users"("referral_code" ASC);

-- CreateIndex
CREATE INDEX "verification_attempts_identifier_idx" ON "public"."verification_attempts"("identifier" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "verification_attempts_identifier_ip_address_key" ON "public"."verification_attempts"("identifier" ASC, "ip_address" ASC);

-- CreateIndex
CREATE INDEX "verification_attempts_ip_address_idx" ON "public"."verification_attempts"("ip_address" ASC);

-- CreateIndex
CREATE INDEX "verification_attempts_last_attempt_idx" ON "public"."verification_attempts"("last_attempt" ASC);

-- CreateIndex
CREATE INDEX "verification_codes_identifier_idx" ON "public"."verification_codes"("identifier" ASC);

-- AddForeignKey
ALTER TABLE "public"."addons" ADD CONSTRAINT "addons_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."device_tokens" ADD CONSTRAINT "device_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."favorite_foods" ADD CONSTRAINT "favorite_foods_food_id_fkey" FOREIGN KEY ("food_id") REFERENCES "public"."foods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."favorite_foods" ADD CONSTRAINT "favorite_foods_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."food_addons" ADD CONSTRAINT "food_addons_addon_id_fkey" FOREIGN KEY ("addon_id") REFERENCES "public"."addons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."food_addons" ADD CONSTRAINT "food_addons_food_id_fkey" FOREIGN KEY ("food_id") REFERENCES "public"."foods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."food_packs" ADD CONSTRAINT "food_packs_food_id_fkey" FOREIGN KEY ("food_id") REFERENCES "public"."foods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."foods" ADD CONSTRAINT "foods_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."foods" ADD CONSTRAINT "foods_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_item_addons" ADD CONSTRAINT "order_item_addons_addon_id_fkey" FOREIGN KEY ("addon_id") REFERENCES "public"."addons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_item_addons" ADD CONSTRAINT "order_item_addons_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_food_id_fkey" FOREIGN KEY ("food_id") REFERENCES "public"."foods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_food_pack_id_fkey" FOREIGN KEY ("food_pack_id") REFERENCES "public"."food_packs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "public"."payment_methods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_methods" ADD CONSTRAINT "payment_methods_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."search_history" ADD CONSTRAINT "search_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_addresses" ADD CONSTRAINT "user_addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

