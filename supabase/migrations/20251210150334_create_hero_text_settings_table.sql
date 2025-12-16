/*
  # Hero Text Styling Settings

  1. New Tables
    - `hero_text_settings`
      - `id` (uuid, primary key)
      - `title_text` (text) - Der Haupttitel
      - `subtitle_text` (text) - Der Untertitel
      - `title_font_size` (text) - CSS-Klassen für Titelgröße
      - `subtitle_font_size` (text) - CSS-Klassen für Untertitelgröße
      - `title_color` (text) - Farbe des Titels
      - `subtitle_color` (text) - Farbe des Untertitels
      - `title_font_weight` (text) - Font-Weight des Titels
      - `subtitle_font_weight` (text) - Font-Weight des Untertitels
      - `text_shadow` (text) - Text-Schatten Stärke
      - `overlay_opacity` (integer) - Dunkles Overlay (0-100)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `hero_text_settings` table
    - Add policies for authenticated admin users
*/

CREATE TABLE IF NOT EXISTS hero_text_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_text text DEFAULT 'Handy Reparatur Ottobrunn',
  subtitle_text text DEFAULT 'iPhone, Samsung & weitere Marken – schnell, fachgerecht und zu fairen Preisen',
  title_font_size text DEFAULT 'text-4xl sm:text-5xl md:text-7xl',
  subtitle_font_size text DEFAULT 'text-xl sm:text-2xl md:text-3xl',
  title_color text DEFAULT '#ffffff',
  subtitle_color text DEFAULT '#ffffff',
  title_font_weight text DEFAULT 'font-bold',
  subtitle_font_weight text DEFAULT 'font-light',
  text_shadow text DEFAULT 'drop-shadow-2xl',
  overlay_opacity integer DEFAULT 40,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE hero_text_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read hero text settings"
  ON hero_text_settings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can update hero text settings"
  ON hero_text_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert hero text settings"
  ON hero_text_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

INSERT INTO hero_text_settings (title_text, subtitle_text)
VALUES (
  'Handy Reparatur Ottobrunn',
  'iPhone, Samsung & weitere Marken – schnell, fachgerecht und zu fairen Preisen'
)
ON CONFLICT DO NOTHING;
