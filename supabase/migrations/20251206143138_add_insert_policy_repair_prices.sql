/*
  # Add Insert Policy for Repair Prices

  1. Changes
    - Add INSERT policy to allow data import via scripts
    - This is needed for initial data loading and updates

  2. Security
    - Keep read access public for catalog browsing
    - Allow inserts for authenticated users (admin operations)
*/

-- Allow authenticated users to insert repair prices (for admin/import operations)
CREATE POLICY "Authenticated users can insert repair prices"
  ON repair_prices
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update repair prices (for admin operations)
CREATE POLICY "Authenticated users can update repair prices"
  ON repair_prices
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete repair prices (for admin operations)
CREATE POLICY "Authenticated users can delete repair prices"
  ON repair_prices
  FOR DELETE
  TO authenticated
  USING (true);
