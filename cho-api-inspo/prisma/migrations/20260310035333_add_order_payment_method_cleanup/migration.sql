-- CreateEnum
CREATE TYPE "OrderPaymentMethod" AS ENUM ('PREPAID', 'CASH_ON_DELIVERY', 'PAY_FOR_ME');

-- AlterTable: Add orderPaymentMethod to orders
ALTER TABLE "orders" ADD COLUMN "order_payment_method" "OrderPaymentMethod" NOT NULL DEFAULT 'PREPAID';

-- AlterTable: Remove payment_method_id from orders
ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "orders_payment_method_id_fkey";
ALTER TABLE "orders" DROP COLUMN IF EXISTS "payment_method_id";

-- DropTable: payment_methods
DROP TABLE IF EXISTS "payment_methods";

-- DropEnum: PaymentType (was only used by payment_methods)
DROP TYPE IF EXISTS "PaymentType";

-- AlterTable: Rename transaction columns (provider-agnostic)
ALTER TABLE "transactions" RENAME COLUMN "paystack_reference" TO "provider_reference";
ALTER TABLE "transactions" RENAME COLUMN "paystack_response" TO "provider_response";

-- RenameIndex
ALTER INDEX IF EXISTS "transactions_paystack_reference_key" RENAME TO "transactions_provider_reference_key";
ALTER INDEX IF EXISTS "transactions_paystack_reference_idx" RENAME TO "transactions_provider_reference_idx";
