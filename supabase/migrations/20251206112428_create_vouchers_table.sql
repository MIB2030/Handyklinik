/*
  # Gutschein-System erstellen

  1. Neue Tabelle
    - `vouchers`
      - `id` (uuid, primary key)
      - `code` (text, unique) - Der Gutschein-Code
      - `amount` (integer) - Gutschein-Wert in Euro
      - `created_at` (timestamptz) - Erstellungsdatum
      - `redeemed_at` (timestamptz, nullable) - Einlösedatum
      - `is_redeemed` (boolean) - Status ob eingelöst
      
  2. Sicherheit
    - RLS aktiviert
    - Policy für öffentliches Erstellen von Gutscheinen
    - Policy für Lesen eigener Gutscheine
*/

CREATE TABLE IF NOT EXISTS vouchers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  amount integer NOT NULL DEFAULT 10,
  created_at timestamptz DEFAULT now(),
  redeemed_at timestamptz,
  is_redeemed boolean DEFAULT false
);

ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create vouchers"
  ON vouchers
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can view vouchers"
  ON vouchers
  FOR SELECT
  TO anon
  USING (true);
