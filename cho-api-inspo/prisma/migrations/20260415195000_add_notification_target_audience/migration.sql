-- Create enum only if it does not already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'NotificationAudience'
  ) THEN
    CREATE TYPE "NotificationAudience" AS ENUM ('USER', 'VENDOR', 'RIDER', 'ALL');
  END IF;
END
$$;

-- Add nullable target audience column
ALTER TABLE "notifications"
ADD COLUMN IF NOT EXISTS "target_audience" "NotificationAudience";

-- Add index for audience + time-based fetches
CREATE INDEX IF NOT EXISTS "notifications_target_audience_created_at_idx"
ON "notifications"("target_audience", "created_at");
