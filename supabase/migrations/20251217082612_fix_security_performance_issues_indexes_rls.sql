/*
  # Fix Security and Performance Issues - Indexes and RLS Policies
  
  1. Performance Improvements
    - Add indexes for unindexed foreign keys:
      - articles.author_id
      - content_sections.updated_by (if foreign key exists)
      - legal_config.updated_by (if foreign key exists)
      - vouchers.redeemed_by (if foreign key exists)
  
  2. RLS Policy Optimization
    - Update policies to use (select auth.uid()) pattern to avoid re-evaluation per row
    - Affected tables: vouchers, user_roles, user_profiles, google_reviews, articles, hero_slides, announcements
  
  3. Multiple Permissive Policies
    - Review and potentially consolidate vouchers UPDATE policies
*/

-- =====================================================
-- 1. ADD INDEXES FOR FOREIGN KEYS
-- =====================================================

-- Index for articles.author_id
CREATE INDEX IF NOT EXISTS idx_articles_author_id ON public.articles(author_id);

-- Index for content_sections.updated_by (if it's a foreign key)
CREATE INDEX IF NOT EXISTS idx_content_sections_updated_by ON public.content_sections(updated_by);

-- Index for legal_config.updated_by (if it's a foreign key)
CREATE INDEX IF NOT EXISTS idx_legal_config_updated_by ON public.legal_config(updated_by);

-- Index for vouchers.redeemed_by (if it's a foreign key)
CREATE INDEX IF NOT EXISTS idx_vouchers_redeemed_by ON public.vouchers(redeemed_by);

-- =====================================================
-- 2. FIX RLS POLICIES - ANNOUNCEMENTS
-- =====================================================

DROP POLICY IF EXISTS "View announcements" ON public.announcements;

CREATE POLICY "View announcements"
  ON public.announcements
  FOR SELECT
  TO authenticated
  USING (
    is_active = true 
    OR EXISTS (
      SELECT 1 
      FROM user_profiles 
      WHERE user_profiles.id = (SELECT auth.uid()) 
      AND user_profiles.role = 'admin'
    )
  );

-- =====================================================
-- 3. FIX RLS POLICIES - ARTICLES
-- =====================================================

DROP POLICY IF EXISTS "View articles" ON public.articles;

CREATE POLICY "View articles"
  ON public.articles
  FOR SELECT
  TO authenticated
  USING (
    status = 'published' 
    OR EXISTS (
      SELECT 1 
      FROM user_profiles 
      WHERE user_profiles.id = (SELECT auth.uid()) 
      AND user_profiles.role = 'admin'
    )
  );

-- =====================================================
-- 4. FIX RLS POLICIES - GOOGLE_REVIEWS
-- =====================================================

DROP POLICY IF EXISTS "View reviews" ON public.google_reviews;

CREATE POLICY "View reviews"
  ON public.google_reviews
  FOR SELECT
  TO authenticated
  USING (
    is_visible = true 
    OR EXISTS (
      SELECT 1 
      FROM user_profiles 
      WHERE user_profiles.id = (SELECT auth.uid()) 
      AND user_profiles.role = 'admin'
    )
  );

-- =====================================================
-- 5. FIX RLS POLICIES - HERO_SLIDES
-- =====================================================

DROP POLICY IF EXISTS "View hero slides" ON public.hero_slides;

CREATE POLICY "View hero slides"
  ON public.hero_slides
  FOR SELECT
  TO authenticated
  USING (
    is_active = true 
    OR EXISTS (
      SELECT 1 
      FROM user_profiles 
      WHERE user_profiles.id = (SELECT auth.uid()) 
      AND user_profiles.role = 'admin'
    )
  );

-- =====================================================
-- 6. FIX RLS POLICIES - USER_PROFILES
-- =====================================================

DROP POLICY IF EXISTS "View profiles" ON public.user_profiles;

CREATE POLICY "View profiles"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (
    id = (SELECT auth.uid()) 
    OR EXISTS (
      SELECT 1 
      FROM user_profiles up 
      WHERE up.id = (SELECT auth.uid()) 
      AND up.role = 'admin'
    )
  );

-- =====================================================
-- 7. FIX RLS POLICIES - USER_ROLES
-- =====================================================

DROP POLICY IF EXISTS "View roles" ON public.user_roles;

CREATE POLICY "View roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid()) 
    OR EXISTS (
      SELECT 1 
      FROM user_profiles 
      WHERE user_profiles.id = (SELECT auth.uid()) 
      AND user_profiles.role = 'admin'
    )
  );

-- =====================================================
-- 8. FIX RLS POLICIES - VOUCHERS
-- =====================================================

-- Drop and recreate the "View vouchers" policy
DROP POLICY IF EXISTS "View vouchers" ON public.vouchers;

CREATE POLICY "View vouchers"
  ON public.vouchers
  FOR SELECT
  TO authenticated
  USING (
    status = 'active' 
    OR EXISTS (
      SELECT 1 
      FROM user_profiles 
      WHERE user_profiles.id = (SELECT auth.uid()) 
      AND user_profiles.role = 'admin'
    )
  );

-- Drop and recreate the "Update vouchers" policy (for admins)
DROP POLICY IF EXISTS "Update vouchers" ON public.vouchers;

CREATE POLICY "Update vouchers"
  ON public.vouchers
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM user_profiles 
      WHERE user_profiles.id = (SELECT auth.uid()) 
      AND user_profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM user_profiles 
      WHERE user_profiles.id = (SELECT auth.uid()) 
      AND user_profiles.role = 'admin'
    )
  );

-- Note: "Public can mark voucher printed" policy remains separate as it serves a different purpose
-- (allows public users to mark a voucher as printed under specific conditions)
