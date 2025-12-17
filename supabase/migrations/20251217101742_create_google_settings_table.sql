/*
  # Create Google Settings Table

  1. New Tables
    - `google_settings`
      - `id` (uuid, primary key) - Unique identifier
      - `api_key` (text, encrypted) - Google Places API Key
      - `place_id` (text) - Google Place ID for the business
      - `auto_sync_enabled` (boolean) - Whether auto-sync is enabled
      - `last_sync_at` (timestamptz) - Last successful sync timestamp
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `google_settings` table
    - Add policy for authenticated admin users to read/update settings
*/

CREATE TABLE IF NOT EXISTS google_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key text,
  place_id text,
  auto_sync_enabled boolean DEFAULT false,
  last_sync_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE google_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can view google settings"
  ON google_settings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin users can update google settings"
  ON google_settings
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

CREATE POLICY "Admin users can insert google settings"
  ON google_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Insert default row
INSERT INTO google_settings (id, api_key, place_id, auto_sync_enabled)
VALUES ('00000000-0000-0000-0000-000000000001', NULL, NULL, false)
ON CONFLICT (id) DO NOTHING;