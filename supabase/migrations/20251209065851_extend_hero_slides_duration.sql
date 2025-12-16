/*
  # Extend hero_slides table with individual slide duration
  
  1. Changes
    - Add `duration_seconds` column to hero_slides table
      - Default: 5 seconds per slide
      - Allows customization per slide
    - Remove limit on number of slides (allow 3, 4, 5+ slides)
  
  2. Notes
    - Each slide can now have its own display duration
    - Order field determines slide sequence
    - No hard limit on number of slides
*/

-- Add duration_seconds column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hero_slides' AND column_name = 'duration_seconds'
  ) THEN
    ALTER TABLE hero_slides ADD COLUMN duration_seconds integer DEFAULT 5 NOT NULL;
  END IF;
END $$;

-- Add check constraint to ensure reasonable duration (1-30 seconds)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'hero_slides' AND constraint_name = 'hero_slides_duration_check'
  ) THEN
    ALTER TABLE hero_slides ADD CONSTRAINT hero_slides_duration_check 
    CHECK (duration_seconds >= 1 AND duration_seconds <= 30);
  END IF;
END $$;