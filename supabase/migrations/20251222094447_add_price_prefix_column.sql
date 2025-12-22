/*
  # Add price prefix column to repair_prices

  1. Changes
    - Add `preis_prefix` column to `repair_prices` table to indicate if "ab" should be shown before price
    - Update all Samsung S Serie Displaytausch entries to show "ab" prefix
  
  2. Security
    - No RLS changes needed
*/

-- Add preis_prefix column
ALTER TABLE repair_prices 
ADD COLUMN IF NOT EXISTS preis_prefix text DEFAULT NULL;

-- Update Samsung S Serie Displaytausch entries to have "ab" prefix
UPDATE repair_prices
SET preis_prefix = 'ab'
WHERE hersteller ILIKE '%samsung s%'
  AND reparatur ILIKE '%display%';