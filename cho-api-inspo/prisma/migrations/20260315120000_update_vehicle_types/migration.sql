-- Migrate existing BIKE values to BICYCLE before removing the variant
UPDATE "rider_vehicle_info" SET "vehicle_type" = 'BICYCLE' WHERE "vehicle_type" = 'BIKE';

-- Recreate enum with updated values (PostgreSQL doesn't support DROP VALUE)
CREATE TYPE "VehicleType_new" AS ENUM ('BICYCLE', 'MOTORCYCLE', 'E_BIKE', 'CAR', 'TRUCK', 'MINI_TRUCK', 'TRICYCLE', 'FOOT');

ALTER TABLE "rider_vehicle_info" ALTER COLUMN "vehicle_type" TYPE "VehicleType_new" USING ("vehicle_type"::text::"VehicleType_new");

ALTER TYPE "VehicleType" RENAME TO "VehicleType_old";
ALTER TYPE "VehicleType_new" RENAME TO "VehicleType";
DROP TYPE "VehicleType_old";
