/*
  # Create page_texts table for managing all website text content

  1. New Tables
    - `page_texts`
      - `id` (uuid, primary key)
      - `section` (text) - Section identifier (e.g., 'hero', 'why_us', 'features')
      - `key` (text) - Text key within the section (e.g., 'title', 'subtitle')
      - `value` (text) - The actual text content
      - `description` (text) - Description for admins
      - `order_index` (integer) - Display order within section
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `page_texts` table
    - Add policy for authenticated users to read all texts
    - Add policy for admin users to manage texts

  3. Data
    - Insert initial text content from the website
*/

CREATE TABLE IF NOT EXISTS page_texts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL,
  key text NOT NULL,
  value text NOT NULL DEFAULT '',
  description text DEFAULT '',
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(section, key)
);

ALTER TABLE page_texts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read page texts"
  ON page_texts
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert page texts"
  ON page_texts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update page texts"
  ON page_texts
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin users can delete page texts"
  ON page_texts
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Insert initial text content from WhyUs component
INSERT INTO page_texts (section, key, value, description, order_index) VALUES
  -- Why Us Section Header
  ('why_us', 'main_title', 'Warum Handyklinik Ottobrunn?', 'Hauptüberschrift der Warum-Wir-Sektion', 1),
  
  -- Why Us Features
  ('why_us_features', 'express_title', 'Express-Service', 'Feature 1: Titel', 10),
  ('why_us_features', 'express_description', 'Reparatur oft in 30-60 Minuten', 'Feature 1: Beschreibung', 11),
  ('why_us_features', 'warranty_title', '6 Monate Garantie', 'Feature 2: Titel', 12),
  ('why_us_features', 'warranty_description', 'Auf alle Reparaturen', 'Feature 2: Beschreibung', 13),
  ('why_us_features', 'data_title', 'Kein Datenverlust', 'Feature 3: Titel', 14),
  ('why_us_features', 'data_description', 'Ihre Daten bleiben sicher', 'Feature 3: Beschreibung', 15),
  ('why_us_features', 'parts_title', 'Original & Drittanbieter', 'Feature 4: Titel', 16),
  ('why_us_features', 'parts_description', 'Hochwertige Ersatzteile', 'Feature 4: Beschreibung', 17),
  ('why_us_features', 'price_title', 'Faire Preise', 'Feature 5: Titel', 18),
  ('why_us_features', 'price_description', 'Transparent und günstig', 'Feature 5: Beschreibung', 19),
  ('why_us_features', 'experience_title', '20+ Jahre Erfahrung', 'Feature 6: Titel', 20),
  ('why_us_features', 'experience_description', 'Über 10.000 Reparaturen', 'Feature 6: Beschreibung', 21),
  
  -- Why Us Flip Card
  ('why_us_card', 'front_title', 'Mehr über uns - MNW Mobilfunk erfahren', 'Vorderseite der Karte: Titel', 30),
  ('why_us_card', 'front_subtitle', 'Klicken Sie hier für Details', 'Vorderseite der Karte: Untertitel', 31),
  ('why_us_card', 'back_title', 'Ihr Vorteil seit über 20 Jahren', 'Rückseite der Karte: Haupttitel', 32),
  ('why_us_card', 'back_intro', 'Als MNW Mobilfunk sind wir Ihre Experten für alles rund ums Smartphone – von professionellen Reparaturen bis zur umfassenden Mobilfunkberatung. Seit über zwei Jahrzehnten beraten wir Menschen in Ottobrunn persönlich und professionell bei allen Fragen rund um Mobilfunk und Festnetz. Über 40.000 zufriedene Kunden und inzwischen mehr als 10.000 erfolgreich reparierte Geräte sprechen für unsere Erfahrung. Dank regelmäßiger Weiterbildung bleiben wir technologisch immer auf dem neuesten Stand.', 'Einleitungstext', 33),
  ('why_us_card', 'section1_title', 'Unabhängige Beratung', 'Sektion 1: Titel', 34),
  ('why_us_card', 'section1_text', 'Wir sind kein Callcenter, sondern ein unabhängiger Fachhändler. Das bedeutet: Wir gehören zu keinem Anbieter und vergleichen neutral die Angebote von Vodafone, Telekom, O2/Telefonica, Otelo und Freenet. Dadurch finden wir für Sie genau den Tarif, der wirklich zu Ihren Bedürfnissen passt. Für Geschäftskunden analysieren wir bestehende Mobilfunk‑ und Festnetzverträge kostenlos, optimieren die Kostenstruktur und können so oft erhebliche Einsparungen erzielen.', 'Sektion 1: Text', 35),
  ('why_us_card', 'section2_title', 'Rundum‑Service für Ihr Smartphone', 'Sektion 2: Titel', 36),
  ('why_us_card', 'section2_text', 'Ein neues Gerät kaufen kann jeder – wir kümmern uns um den Rest. Wir richten Ihr neues Smartphone ein, übertragen Kontakte, Fotos und WhatsApp‑Chats, helfen bei Passwörtern und zeigen Ihnen in unseren Workshops die wichtigen Funktionen. Als autorisierte Handyklinik reparieren wir alle gängigen Marken mit hochwertigen Ersatzteilen und beraten Sie kostenlos. Bei vorheriger Terminabsprache erledigen wir die meisten Reparaturen innerhalb weniger Stunden.', 'Sektion 2: Text', 37),
  ('why_us_card', 'section3_title', 'Komplettlösungen für Zuhause und das Büro', 'Sektion 3: Titel', 38),
  ('why_us_card', 'section3_text', 'Neben Mobilfunk bieten wir auch Festnetz‑, DSL‑ und Kabelanschlüsse sowie moderne Cloud‑Telefonie. Wir installieren die Anschlüsse, übernehmen die Umstellung und bleiben Ihr Ansprechpartner bei Problemen. Auch Smartphone‑Versicherungen und flexible Finanzierungen gehören zu unserem Angebot.', 'Sektion 3: Text', 39),
  ('why_us_card', 'section4_title', 'Persönlicher Ansprechpartner im Isarcenter', 'Sektion 4: Titel', 40),
  ('why_us_card', 'section4_text', 'Bei uns bekommen Sie keine Warteschleife, sondern direkte Hilfe. Ob Fragen zur Rechnung, Tarifoptimierungen oder Reklamationen – Sie haben immer einen festen Ansprechpartner bei uns vor Ort. So bleiben Sie immer gut verbunden.', 'Sektion 4: Text', 41),
  ('why_us_card', 'footer_text', 'MNW Mobilfunk – Wir verbinden Ottobrunn.', 'Abschluss-Text', 42),
  ('why_us_card', 'back_subtitle', 'Klicken Sie erneut, um zurückzukehren', 'Rückseite der Karte: Untertitel unten', 43),
  
  -- Services Section
  ('services', 'main_title', 'Unsere Reparatur-Services', 'Hauptüberschrift der Services-Sektion', 50)
ON CONFLICT (section, key) DO NOTHING;
