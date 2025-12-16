/*
  # Add manufacturer field to articles table

  1. Changes
    - Add `manufacturer` column to `articles` table
      - Type: text (nullable)
      - Used to categorize articles by device manufacturer (Apple, Samsung, etc.)
      - Helps filter and organize articles by brand
  
  2. Notes
    - Column is nullable to maintain compatibility with existing articles
    - Manufacturer names should match those in repair_prices table
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'manufacturer'
  ) THEN
    ALTER TABLE articles ADD COLUMN manufacturer text;
    
    CREATE INDEX IF NOT EXISTS idx_articles_manufacturer ON articles(manufacturer);
  END IF;
END $$;
