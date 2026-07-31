-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED');

-- AlterTable
ALTER TABLE "restaurants" ADD COLUMN     "order_type" VARCHAR(50),
ADD COLUMN     "type" VARCHAR(100);

-- AlterTable
ALTER TABLE "vendors" ADD COLUMN     "is_payment_info_complete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_personal_info_complete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_restaurant_info_complete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verification_status" "VerificationStatus" NOT NULL DEFAULT 'PENDING';
