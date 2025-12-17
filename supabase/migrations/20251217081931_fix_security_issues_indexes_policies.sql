/*
  # Fix Security Issues
  
  1. Performance Improvements
    - Drop unused indexes that have not been used:
      - idx_content_sections_updated_by
      - idx_legal_config_updated_by
      - idx_vouchers_redeemed_by
      - idx_articles_author_id
  
  2. Security Fixes
    - Fix function search_path mutability for mark_voucher_redeemed trigger function
    - Consolidate multiple permissive policies into single policies to reduce complexity
  
  3. Policy Consolidation
    - Combine admin and public policies into single policies with OR conditions
    - Affects tables: announcements, articles, google_reviews, hero_slides, user_profiles, user_roles, vouchers
*/

-- Drop unused indexes
DROP INDEX IF EXISTS idx_content_sections_updated_by;
DROP INDEX IF EXISTS idx_legal_config_updated_by;
DROP INDEX IF EXISTS idx_vouchers_redeemed_by;
DROP INDEX IF EXISTS idx_articles_author_id;

-- Fix function search_path for trigger function
CREATE OR REPLACE FUNCTION mark_voucher_redeemed()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.redeemed_at IS NOT NULL AND OLD.redeemed_at IS NULL THEN
    NEW.status = 'redeemed';
  END IF;
  RETURN NEW;
END;
$$;

-- Consolidate announcements policies
DROP POLICY IF EXISTS "Admins can view all announcements" ON announcements;
DROP POLICY IF EXISTS "Anyone can view active announcements" ON announcements;

CREATE POLICY "View announcements"
  ON announcements FOR SELECT
  TO authenticated
  USING (
    is_active = true 
    OR 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- Consolidate articles policies
DROP POLICY IF EXISTS "Admins can view all articles" ON articles;
DROP POLICY IF EXISTS "Anyone can view published articles" ON articles;

CREATE POLICY "View articles"
  ON articles FOR SELECT
  TO authenticated
  USING (
    status = 'published' 
    OR 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- Consolidate google_reviews policies
DROP POLICY IF EXISTS "Admins can view all reviews" ON google_reviews;
DROP POLICY IF EXISTS "Anyone can view visible reviews" ON google_reviews;

CREATE POLICY "View reviews"
  ON google_reviews FOR SELECT
  TO authenticated
  USING (
    is_visible = true 
    OR 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- Consolidate hero_slides policies
DROP POLICY IF EXISTS "Admins can view all hero slides" ON hero_slides;
DROP POLICY IF EXISTS "Anyone can view active hero slides" ON hero_slides;

CREATE POLICY "View hero slides"
  ON hero_slides FOR SELECT
  TO authenticated
  USING (
    is_active = true 
    OR 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- Consolidate user_profiles policies
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;

CREATE POLICY "View profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() 
    OR 
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.id = auth.uid() 
      AND up.role = 'admin'
    )
  );

-- Consolidate user_roles policies
DROP POLICY IF EXISTS "Admins can read all roles" ON user_roles;
DROP POLICY IF EXISTS "Users can read own role" ON user_roles;

CREATE POLICY "View roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() 
    OR 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- Consolidate vouchers SELECT policies
DROP POLICY IF EXISTS "Admins can view all vouchers" ON vouchers;
DROP POLICY IF EXISTS "Public can view active vouchers by code" ON vouchers;

CREATE POLICY "View vouchers"
  ON vouchers FOR SELECT
  TO authenticated
  USING (
    status = 'active'
    OR 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- Consolidate vouchers UPDATE policies
DROP POLICY IF EXISTS "Admins can update vouchers" ON vouchers;
DROP POLICY IF EXISTS "Public can update printed_at" ON vouchers;

CREATE POLICY "Update vouchers"
  ON vouchers FOR UPDATE
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

-- Add separate policy for public to update printed_at only
CREATE POLICY "Public can mark voucher printed"
  ON vouchers FOR UPDATE
  TO authenticated
  USING (
    status = 'active' 
    AND is_redeemed = false
    AND printed_at IS NULL
  )
  WITH CHECK (
    printed_at IS NOT NULL 
    AND code = (SELECT code FROM vouchers WHERE id = vouchers.id)
    AND status = (SELECT status FROM vouchers WHERE id = vouchers.id)
  );
