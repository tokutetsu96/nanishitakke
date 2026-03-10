-- Add end_date column to activities table for cross-midnight activity support
-- end_date is the date on which the activity ends
-- For same-day activities, end_date = date
-- For activities crossing midnight (end_time < start_time), end_date = date + 1 day

ALTER TABLE activities ADD COLUMN IF NOT EXISTS end_date date;

-- Backfill existing records: set end_date = date for all existing activities
UPDATE activities SET end_date = date WHERE end_date IS NULL;

-- Make end_date NOT NULL with default = date
ALTER TABLE activities ALTER COLUMN end_date SET NOT NULL;
ALTER TABLE activities ALTER COLUMN end_date SET DEFAULT CURRENT_DATE;

-- Index for efficient querying by date range
CREATE INDEX IF NOT EXISTS idx_activities_date_end_date ON activities (user_id, date, end_date);
