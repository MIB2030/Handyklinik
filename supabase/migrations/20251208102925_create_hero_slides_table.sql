/*
  # Create Hero Slides Table

  1. New Tables
    - `hero_slides`
      - `id` (uuid, primary key)
      - `image_url` (text) - URL to the slide image
      - `alt_text` (text) - Alt text for the image
      - `display_order` (integer) - Order in which slides appear
      - `is_active` (boolean) - Whether the slide is active
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `hero_slideshow_settings`
      - `id` (uuid, primary key)
      - `auto_play` (boolean) - Whether slideshow auto-advances
      - `transition_duration` (integer) - Seconds between transitions
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated admins to manage slides
    - Add policies for public read access
*/

CREATE TABLE IF NOT EXISTS hero_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  alt_text text DEFAULT 'Smartphone Reparatur',
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hero_slideshow_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auto_play boolean DEFAULT true,
  transition_duration integer DEFAULT 20,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_slideshow_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active hero slides"
  ON hero_slides
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can insert hero slides"
  ON hero_slides
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update hero slides"
  ON hero_slides
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

CREATE POLICY "Admins can delete hero slides"
  ON hero_slides
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can view all hero slides"
  ON hero_slides
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Anyone can view slideshow settings"
  ON hero_slideshow_settings
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert slideshow settings"
  ON hero_slideshow_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update slideshow settings"
  ON hero_slideshow_settings
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

INSERT INTO hero_slideshow_settings (auto_play, transition_duration)
SELECT true, 20
WHERE NOT EXISTS (SELECT 1 FROM hero_slideshow_settings);

INSERT INTO hero_slides (image_url, alt_text, display_order, is_active)
VALUES 
  ('/image copy copy copy copy copy copy.png', 'Smartphone Reparatur Ottobrunn', 1, true),
  ('/image copy copy copy copy copy copy copy copy copy copy copy copy.png', 'Professionelle Handy Reparatur', 2, true)
ON CONFLICT DO NOTHING;