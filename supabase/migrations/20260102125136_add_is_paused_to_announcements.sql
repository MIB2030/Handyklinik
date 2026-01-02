/*
  # Add pause functionality to announcements

  1. Changes
    - Add `is_paused` column to `announcements` table
    - Default value is `false` (not paused)
    - Allows temporary pausing without deactivating

  2. Purpose
    - Enables admin to temporarily pause an announcement
    - Different from `is_active`: active but paused announcements won't show
    - Useful for temporary breaks without losing configuration
*/

-- Add is_paused column to announcements table
ALTER TABLE announcements 
ADD COLUMN IF NOT EXISTS is_paused boolean DEFAULT false NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN announcements.is_paused IS 'Temporary pause flag - paused announcements will not display even if active';
