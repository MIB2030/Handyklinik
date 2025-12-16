/*
  # Create Repair Prices Table

  1. New Tables
    - `repair_prices`
      - `id` (uuid, primary key) - Unique identifier
      - `hersteller` (text) - Manufacturer name (e.g., 'Apple iPhone')
      - `modell` (text) - Model name (e.g., 'iPhone 13')
      - `reparatur` (text) - Repair type (e.g., 'Displaytausch Original')
      - `preis` (decimal) - Price in euros
      - `beschreibung` (text) - Description of the repair
      - `created_at` (timestamptz) - Record creation timestamp

  2. Security
    - Enable RLS on `repair_prices` table
    - Add policy for public read access (catalog data)
    - No write access for public users

  3. Indexes
    - Index on `hersteller` for fast manufacturer lookups
    - Index on `modell` for fast model lookups
    - Composite index on `hersteller, modell` for filtering
*/

CREATE TABLE IF NOT EXISTS repair_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hersteller text NOT NULL,
  modell text NOT NULL,
  reparatur text NOT NULL,
  preis decimal(10, 2) NOT NULL,
  beschreibung text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE repair_prices ENABLE ROW LEVEL SECURITY;

-- Allow public read access to repair prices (catalog data)
CREATE POLICY "Anyone can view repair prices"
  ON repair_prices
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_repair_prices_hersteller ON repair_prices(hersteller);
CREATE INDEX IF NOT EXISTS idx_repair_prices_modell ON repair_prices(modell);
CREATE INDEX IF NOT EXISTS idx_repair_prices_hersteller_modell ON repair_prices(hersteller, modell);
