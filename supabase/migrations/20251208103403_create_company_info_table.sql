/*
  # Create Company Info Table

  1. New Tables
    - `company_info`
      - `id` (uuid, primary key)
      - `company_name` (text) - Name des Unternehmens
      - `street` (text) - Straße und Hausnummer
      - `postal_code` (text) - Postleitzahl
      - `city` (text) - Stadt
      - `phone` (text) - Telefonnummer
      - `mobile` (text) - Mobilnummer
      - `email` (text) - E-Mail Adresse
      - `opening_hours` (text) - Öffnungszeiten
      - `whatsapp` (text) - WhatsApp Nummer
      - `instagram` (text) - Instagram Handle
      - `facebook` (text) - Facebook URL
      - `google_maps_url` (text) - Google Maps Link
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on company_info table
    - Add policies for public read access
    - Add policies for authenticated admins to update
*/

CREATE TABLE IF NOT EXISTS company_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text DEFAULT 'Handy Klinik Ottobrunn',
  street text DEFAULT 'Otto-Hahn-Straße 4',
  postal_code text DEFAULT '85521',
  city text DEFAULT 'Ottobrunn',
  phone text DEFAULT '089 12345678',
  mobile text DEFAULT '0176 12345678',
  email text DEFAULT 'info@handyklinikottobrunn.de',
  opening_hours text DEFAULT 'Mo-Fr: 10:00-18:00 Uhr, Sa: 10:00-14:00 Uhr',
  whatsapp text DEFAULT '0176 12345678',
  instagram text DEFAULT '@handyklinikottobrunn',
  facebook text DEFAULT 'https://facebook.com/handyklinikottobrunn',
  google_maps_url text DEFAULT 'https://maps.google.com',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE company_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view company info"
  ON company_info
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert company info"
  ON company_info
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update company info"
  ON company_info
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

INSERT INTO company_info (company_name, street, postal_code, city, phone, mobile, email, opening_hours, whatsapp)
SELECT 'Handy Klinik Ottobrunn', 'Otto-Hahn-Straße 4', '85521', 'Ottobrunn', '089 12345678', '0176 12345678', 'info@handyklinikottobrunn.de', 'Mo-Fr: 10:00-18:00 Uhr, Sa: 10:00-14:00 Uhr', '0176 12345678'
WHERE NOT EXISTS (SELECT 1 FROM company_info);