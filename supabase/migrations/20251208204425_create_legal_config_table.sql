/*
  # Create Legal Config Table

  1. New Tables
    - `legal_config`
      - `id` (uuid, primary key)
      - `api_url` (text) - IT-Recht Kanzlei API URL
      - `api_token` (text) - API authentication token
      - `shop_id` (text) - Shop/Mandanten ID
      - `enabled` (boolean) - Whether API is enabled
      - `updated_at` (timestamp) - Last update time
      - `updated_by` (uuid) - User who made the update

  2. Security
    - Enable RLS on `legal_config` table
    - Only admin users can view and update configuration
    - Prevent accidental deletion

  3. Notes
    - Single row table (only one config needed)
    - Stores sensitive API credentials securely
*/

CREATE TABLE IF NOT EXISTS legal_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_url text NOT NULL DEFAULT 'https://www.it-recht-kanzlei.de/api/v1',
  api_token text NOT NULL DEFAULT '',
  shop_id text NOT NULL DEFAULT '',
  enabled boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE legal_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can read legal config"
  ON legal_config
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update legal config"
  ON legal_config
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

CREATE POLICY "Only admins can insert legal config"
  ON legal_config
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

INSERT INTO legal_config (api_url, api_token, shop_id, enabled)
VALUES ('https://www.it-recht-kanzlei.de/api/v1', '', '', false)
ON CONFLICT DO NOTHING;
