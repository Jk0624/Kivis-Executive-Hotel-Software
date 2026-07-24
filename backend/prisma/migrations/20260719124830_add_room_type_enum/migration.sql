-- Create the enum
CREATE TYPE "RoomType" AS ENUM (
    'STANDARD',
    'EXECUTIVE',
    'SUITE'
);

-- Convert the existing column from TEXT to RoomType
ALTER TABLE "Room"
ALTER COLUMN "type"
TYPE "RoomType"
USING ("type"::"RoomType");