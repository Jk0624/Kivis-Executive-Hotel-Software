-- Add is_online column for rider online/offline availability toggle
ALTER TABLE "riders"
ADD COLUMN IF NOT EXISTS "is_online" BOOLEAN NOT NULL DEFAULT false;
