/*
  # CMS-System Datenbank-Schema
  
  1. Neue Tabellen
    - `user_roles`
      - Speichert Benutzerrollen und Berechtigungen
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key zu auth.users)
      - `role` (text, 'admin' oder 'editor')
      - `created_at` (timestamp)
      
    - `content_sections`
      - Speichert bearbeitbare Content-Bereiche
      - `id` (uuid, primary key)
      - `section_key` (text, unique - z.B. 'hero_title', 'hero_subtitle')
      - `section_name` (text - Anzeigename)
      - `content` (text - der eigentliche Inhalt)
      - `content_type` (text - 'text', 'html', 'json')
      - `updated_at` (timestamp)
      - `updated_by` (uuid, foreign key zu auth.users)
      
    - `faq_items`
      - Speichert FAQ-Einträge
      - `id` (uuid, primary key)
      - `question` (text)
      - `answer` (text)
      - `order_index` (integer)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      
    - `testimonials`
      - Speichert Kundenbewertungen
      - `id` (uuid, primary key)
      - `customer_name` (text)
      - `content` (text)
      - `rating` (integer, 1-5)
      - `order_index` (integer)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      
    - `service_items`
      - Speichert Dienstleistungen
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `icon_name` (text)
      - `order_index` (integer)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      
  2. Security
    - Enable RLS auf allen Tabellen
    - Public read access für Content-Tabellen
    - Admin-only write access für alle Tabellen
*/

-- User Roles Table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'editor')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Admins can view all roles
CREATE POLICY "Admins can view all roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Admins can insert roles
CREATE POLICY "Admins can insert roles"
  ON user_roles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Admins can update roles
CREATE POLICY "Admins can update roles"
  ON user_roles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Admins can delete roles
CREATE POLICY "Admins can delete roles"
  ON user_roles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Content Sections Table
CREATE TABLE IF NOT EXISTS content_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text UNIQUE NOT NULL,
  section_name text NOT NULL,
  content text DEFAULT '',
  content_type text DEFAULT 'text' CHECK (content_type IN ('text', 'html', 'json')),
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

ALTER TABLE content_sections ENABLE ROW LEVEL SECURITY;

-- Everyone can read content
CREATE POLICY "Anyone can read content sections"
  ON content_sections FOR SELECT
  TO public
  USING (true);

-- Admins can modify content
CREATE POLICY "Admins can insert content sections"
  ON content_sections FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

CREATE POLICY "Admins can update content sections"
  ON content_sections FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- FAQ Items Table
CREATE TABLE IF NOT EXISTS faq_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;

-- Everyone can read active FAQs
CREATE POLICY "Anyone can read active FAQs"
  ON faq_items FOR SELECT
  TO public
  USING (is_active = true);

-- Admins can manage FAQs
CREATE POLICY "Admins can insert FAQs"
  ON faq_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

CREATE POLICY "Admins can update FAQs"
  ON faq_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete FAQs"
  ON faq_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Testimonials Table
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  content text NOT NULL,
  rating integer DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Everyone can read active testimonials
CREATE POLICY "Anyone can read active testimonials"
  ON testimonials FOR SELECT
  TO public
  USING (is_active = true);

-- Admins can manage testimonials
CREATE POLICY "Admins can insert testimonials"
  ON testimonials FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

CREATE POLICY "Admins can update testimonials"
  ON testimonials FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete testimonials"
  ON testimonials FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Service Items Table
CREATE TABLE IF NOT EXISTS service_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  icon_name text DEFAULT 'Wrench',
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE service_items ENABLE ROW LEVEL SECURITY;

-- Everyone can read active services
CREATE POLICY "Anyone can read active services"
  ON service_items FOR SELECT
  TO public
  USING (is_active = true);

-- Admins can manage services
CREATE POLICY "Admins can insert services"
  ON service_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

CREATE POLICY "Admins can update services"
  ON service_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete services"
  ON service_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Insert default content sections
INSERT INTO content_sections (section_key, section_name, content, content_type) VALUES
  ('hero_title', 'Hero Titel', 'Handy Reparatur in Berlin - Schnell, Günstig & Professionell', 'text'),
  ('hero_subtitle', 'Hero Untertitel', 'Express-Reparatur in 30-60 Minuten. Vor Ort Service ohne Termin. Faire Preise mit Bestpreis-Garantie!', 'text'),
  ('whyus_title', 'Warum Wir - Titel', 'Warum MNW-Mobilfunk?', 'text'),
  ('contact_phone', 'Telefonnummer', '030 12345678', 'text'),
  ('contact_email', 'E-Mail', 'info@mnw-mobilfunk.de', 'text'),
  ('contact_address', 'Adresse', 'Musterstraße 123, 12345 Berlin', 'text')
ON CONFLICT (section_key) DO NOTHING;