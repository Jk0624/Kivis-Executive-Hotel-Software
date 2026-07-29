/*
  Warnings:

  - You are about to drop the column `id_back_url` on the `rider_vehicle_info` table. All the data in the column will be lost.
  - You are about to drop the column `id_front_url` on the `rider_vehicle_info` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "rider_vehicle_info" DROP COLUMN "id_back_url",
DROP COLUMN "id_front_url",
ADD COLUMN     "id_back_key" VARCHAR(500),
ADD COLUMN     "id_front_key" VARCHAR(500);
