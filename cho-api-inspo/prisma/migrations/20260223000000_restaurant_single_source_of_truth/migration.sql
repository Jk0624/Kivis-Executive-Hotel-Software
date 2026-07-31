-- Step 1: Add new columns to restaurants
ALTER TABLE "restaurants" ADD COLUMN "is_info_complete" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "restaurants" ADD COLUMN "is_payment_info_complete" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "restaurants" ADD COLUMN "verification_status" "VerificationStatus" NOT NULL DEFAULT 'PENDING';

-- Step 2: Backfill restaurant fields from vendor data
UPDATE "restaurants" r
SET
  "is_info_complete" = v."is_restaurant_info_complete",
  "is_payment_info_complete" = v."is_payment_info_complete",
  "verification_status" = v."verification_status"
FROM "vendors" v
WHERE r."vendor_id" = v."id";

-- Step 3: Set restaurant status to INACTIVE where is_active was false
UPDATE "restaurants" SET "status" = 'INACTIVE' WHERE "is_active" = false;

-- Step 4: Create restaurant_payment_details table
CREATE TABLE "restaurant_payment_details" (
  "id" BIGSERIAL NOT NULL,
  "restaurant_id" BIGINT NOT NULL,
  "method" "PayoutMethod" NOT NULL DEFAULT 'MOMO',
  "bank_name" VARCHAR(100),
  "network" VARCHAR(50),
  "phone" VARCHAR(20),
  "account_name" VARCHAR(200) NOT NULL,
  "account_number" VARCHAR(50),
  "is_default" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "restaurant_payment_details_pkey" PRIMARY KEY ("id")
);

-- Step 5: Migrate vendor payment details to restaurant payment details
-- Link each vendor's payment details to their first restaurant
INSERT INTO "restaurant_payment_details" ("restaurant_id", "method", "bank_name", "network", "phone", "account_name", "account_number", "is_default", "created_at", "updated_at")
SELECT
  r."id" AS "restaurant_id",
  vpd."method",
  vpd."bank_name",
  vpd."network",
  vpd."phone",
  vpd."account_name",
  vpd."account_number",
  vpd."is_default",
  vpd."created_at",
  vpd."updated_at"
FROM "vendor_payment_details" vpd
INNER JOIN (
  SELECT DISTINCT ON ("vendor_id") "id", "vendor_id"
  FROM "restaurants"
  ORDER BY "vendor_id", "id" ASC
) r ON r."vendor_id" = vpd."vendor_id";

-- Step 6: Drop old columns and tables
DROP INDEX IF EXISTS "restaurants_is_active_idx";
ALTER TABLE "restaurants" DROP COLUMN "is_active";

ALTER TABLE "vendors" DROP COLUMN "is_restaurant_info_complete";
ALTER TABLE "vendors" DROP COLUMN "is_payment_info_complete";
ALTER TABLE "vendors" DROP COLUMN "verification_status";

DROP TABLE "vendor_payment_details";

-- Step 7: Change status default from ACTIVE to PENDING
ALTER TABLE "restaurants" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- Step 8: Add new indexes
CREATE INDEX "restaurants_verification_status_idx" ON "restaurants"("verification_status");

-- Step 9: Add foreign key for restaurant_payment_details
ALTER TABLE "restaurant_payment_details" ADD CONSTRAINT "restaurant_payment_details_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
