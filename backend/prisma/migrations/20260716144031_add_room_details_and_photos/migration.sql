-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "amenities" TEXT[],
ADD COLUMN     "description" TEXT,
ADD COLUMN     "photos" TEXT[],
ALTER COLUMN "updatedAt" DROP DEFAULT;
