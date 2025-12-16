/*
  # Create vacation_mode table for managing vacation/holiday periods
  
  1. New Tables
    - `vacation_mode`
      - `id` (uuid, primary key)
      - `is_active` (boolean) - Whether vacation mode is currently enabled
      - `start_date` (date) - Start date of vacation period
      - `end_date` (date) - End date of vacation period
      - `message` (text) - Custom message to display to customers
      - `show_banner` (boolean) - Whether to show the banner on website
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `vacation_mode` table
    - Add policy for public read access (everyone can see vacation status)
    - Add policy for authenticated admins to manage vacation settings
  
  3. Notes
    - Only one active vacation mode entry should exist at a time
    - Customers can still submit requests during vacation mode
    - Message should emphasize that Handyshop remains open while Handyklinik is closed
*/

-- Create vacation_mode table
CREATE TABLE IF NOT EXISTS vacation_mode (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active boolean DEFAULT false NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  message text DEFAULT 'Unsere Handyklinik ist vom {start_date} bis {end_date} im Urlaub. Unser Handyshop ist normal geöffnet!' NOT NULL,
  show_banner boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE vacation_mode ENABLE ROW LEVEL SECURITY;

-- Public can read vacation mode status
CREATE POLICY "Anyone can view vacation mode"
  ON vacation_mode
  FOR SELECT
  TO public
  USING (true);

-- Only admins can insert vacation mode settings
CREATE POLICY "Admins can insert vacation mode"
  ON vacation_mode
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Only admins can update vacation mode settings
CREATE POLICY "Admins can update vacation mode"
  ON vacation_mode
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Only admins can delete vacation mode settings
CREATE POLICY "Admins can delete vacation mode"
  ON vacation_mode
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_vacation_mode_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vacation_mode_updated_at
  BEFORE UPDATE ON vacation_mode
  FOR EACH ROW
  EXECUTE FUNCTION update_vacation_mode_updated_at();

-- Insert default vacation mode entry (inactive)
INSERT INTO vacation_mode (is_active, start_date, end_date, message, show_banner)
VALUES (
  false,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '7 days',
  '🏖️ Unsere Handyklinik ist im Urlaub! Unser Handyshop ist weiterhin normal geöffnet.',
  true
)
ON CONFLICT DO NOTHING;