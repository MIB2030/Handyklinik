/*
  # RLS Infinite Recursion beheben

  1. Problem
    - user_roles Policies verursachen eine unendliche Rekursion
    - Policies prüfen "EXISTS (SELECT FROM user_roles)" was die gleiche Policy wieder aufruft

  2. Lösung
    - Erstelle eine SECURITY DEFINER Funktion, die RLS umgeht
    - Ersetze alle Policy-Checks durch diese Funktion
    - Benutzer können ihre eigenen Rollen ohne Admin-Check lesen

  3. Änderungen
    - Entferne alle existierenden user_roles Policies
    - Erstelle neue, sichere Policies ohne Rekursion
    - Füge Helper-Funktion hinzu
*/

-- Lösche alle existierenden Policies auf user_roles
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON user_roles;

-- Erstelle eine SECURITY DEFINER Funktion, die RLS umgeht
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = is_admin.user_id
    AND user_roles.role = 'admin'
  );
END;
$$;

-- Neue Policies für user_roles ohne Rekursion
CREATE POLICY "Users can read own role"
  ON user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can read all roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert roles"
  ON user_roles FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update roles"
  ON user_roles FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete roles"
  ON user_roles FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Update content_sections Policies
DROP POLICY IF EXISTS "Admins can insert content sections" ON content_sections;
DROP POLICY IF EXISTS "Admins can update content sections" ON content_sections;

CREATE POLICY "Admins can insert content sections"
  ON content_sections FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update content sections"
  ON content_sections FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Update faq_items Policies
DROP POLICY IF EXISTS "Admins can insert FAQs" ON faq_items;
DROP POLICY IF EXISTS "Admins can update FAQs" ON faq_items;
DROP POLICY IF EXISTS "Admins can delete FAQs" ON faq_items;

CREATE POLICY "Admins can insert FAQs"
  ON faq_items FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update FAQs"
  ON faq_items FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete FAQs"
  ON faq_items FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Update testimonials Policies
DROP POLICY IF EXISTS "Admins can insert testimonials" ON testimonials;
DROP POLICY IF EXISTS "Admins can update testimonials" ON testimonials;
DROP POLICY IF EXISTS "Admins can delete testimonials" ON testimonials;

CREATE POLICY "Admins can insert testimonials"
  ON testimonials FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update testimonials"
  ON testimonials FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete testimonials"
  ON testimonials FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Update service_items Policies
DROP POLICY IF EXISTS "Admins can insert services" ON service_items;
DROP POLICY IF EXISTS "Admins can update services" ON service_items;
DROP POLICY IF EXISTS "Admins can delete services" ON service_items;

CREATE POLICY "Admins can insert services"
  ON service_items FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update services"
  ON service_items FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete services"
  ON service_items FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Update user_profiles Policies
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;

CREATE POLICY "Admins can read all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));
