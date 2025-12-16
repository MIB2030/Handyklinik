/*
  # Fix User Roles Infinite Recursion
  
  ## Problem
  RLS policies on user_roles table are recursive - they check user_roles to determine access to user_roles,
  causing infinite recursion errors.
  
  ## Solution
  Create a SECURITY DEFINER helper function that bypasses RLS to check if user is admin.
  Replace all recursive policy checks with this function.
  
  ## Changes
  1. Create is_admin() helper function with SECURITY DEFINER
  2. Rewrite all user_roles policies to avoid recursion
  3. Update all admin policies across other tables to use the helper function
*/

-- =====================================================
-- 1. CREATE HELPER FUNCTION TO CHECK ADMIN STATUS
-- =====================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role
  FROM public.user_roles
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  RETURN user_role = 'admin';
END;
$$;

-- =====================================================
-- 2. FIX USER_ROLES TABLE POLICIES (NON-RECURSIVE)
-- =====================================================

-- Users can read their own role (non-recursive)
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
CREATE POLICY "Users can read own role"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Admins can read all roles (using helper function)
DROP POLICY IF EXISTS "Admins can read all roles" ON public.user_roles;
CREATE POLICY "Admins can read all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Admins can insert roles (using helper function)
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Admins can update roles (using helper function)
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
CREATE POLICY "Admins can update roles"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- Admins can delete roles (using helper function)
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =====================================================
-- 3. UPDATE ALL OTHER TABLES TO USE HELPER FUNCTION
-- =====================================================

-- user_profiles
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.user_profiles;
CREATE POLICY "Admins can read all profiles"
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- google_reviews
DROP POLICY IF EXISTS "Admins can view all reviews" ON public.google_reviews;
CREATE POLICY "Admins can view all reviews"
  ON public.google_reviews FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert reviews" ON public.google_reviews;
CREATE POLICY "Admins can insert reviews"
  ON public.google_reviews FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update reviews" ON public.google_reviews;
CREATE POLICY "Admins can update reviews"
  ON public.google_reviews FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- google_reviews_sync_log
DROP POLICY IF EXISTS "Admins can view sync logs" ON public.google_reviews_sync_log;
CREATE POLICY "Admins can view sync logs"
  ON public.google_reviews_sync_log FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert sync logs" ON public.google_reviews_sync_log;
CREATE POLICY "Admins can insert sync logs"
  ON public.google_reviews_sync_log FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- articles
DROP POLICY IF EXISTS "Admins can view all articles" ON public.articles;
CREATE POLICY "Admins can view all articles"
  ON public.articles FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can create articles" ON public.articles;
CREATE POLICY "Admins can create articles"
  ON public.articles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update articles" ON public.articles;
CREATE POLICY "Admins can update articles"
  ON public.articles FOR UPDATE
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete articles" ON public.articles;
CREATE POLICY "Admins can delete articles"
  ON public.articles FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- announcements
DROP POLICY IF EXISTS "Admins can view all announcements" ON public.announcements;
CREATE POLICY "Admins can view all announcements"
  ON public.announcements FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can create announcements" ON public.announcements;
CREATE POLICY "Admins can create announcements"
  ON public.announcements FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update announcements" ON public.announcements;
CREATE POLICY "Admins can update announcements"
  ON public.announcements FOR UPDATE
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete announcements" ON public.announcements;
CREATE POLICY "Admins can delete announcements"
  ON public.announcements FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- content_sections
DROP POLICY IF EXISTS "Admins can insert content sections" ON public.content_sections;
CREATE POLICY "Admins can insert content sections"
  ON public.content_sections FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update content sections" ON public.content_sections;
CREATE POLICY "Admins can update content sections"
  ON public.content_sections FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- faq_items
DROP POLICY IF EXISTS "Admins can insert FAQs" ON public.faq_items;
CREATE POLICY "Admins can insert FAQs"
  ON public.faq_items FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update FAQs" ON public.faq_items;
CREATE POLICY "Admins can update FAQs"
  ON public.faq_items FOR UPDATE
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete FAQs" ON public.faq_items;
CREATE POLICY "Admins can delete FAQs"
  ON public.faq_items FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- testimonials
DROP POLICY IF EXISTS "Admins can insert testimonials" ON public.testimonials;
CREATE POLICY "Admins can insert testimonials"
  ON public.testimonials FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update testimonials" ON public.testimonials;
CREATE POLICY "Admins can update testimonials"
  ON public.testimonials FOR UPDATE
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete testimonials" ON public.testimonials;
CREATE POLICY "Admins can delete testimonials"
  ON public.testimonials FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- service_items
DROP POLICY IF EXISTS "Admins can insert services" ON public.service_items;
CREATE POLICY "Admins can insert services"
  ON public.service_items FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update services" ON public.service_items;
CREATE POLICY "Admins can update services"
  ON public.service_items FOR UPDATE
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete services" ON public.service_items;
CREATE POLICY "Admins can delete services"
  ON public.service_items FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- vouchers
DROP POLICY IF EXISTS "Admins can view all vouchers" ON public.vouchers;
CREATE POLICY "Admins can view all vouchers"
  ON public.vouchers FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update vouchers" ON public.vouchers;
CREATE POLICY "Admins can update vouchers"
  ON public.vouchers FOR UPDATE
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete vouchers" ON public.vouchers;
CREATE POLICY "Admins can delete vouchers"
  ON public.vouchers FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- voucher_downloads
DROP POLICY IF EXISTS "Admins can view download stats" ON public.voucher_downloads;
CREATE POLICY "Admins can view download stats"
  ON public.voucher_downloads FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- hero_slides
DROP POLICY IF EXISTS "Admins can view all hero slides" ON public.hero_slides;
CREATE POLICY "Admins can view all hero slides"
  ON public.hero_slides FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert hero slides" ON public.hero_slides;
CREATE POLICY "Admins can insert hero slides"
  ON public.hero_slides FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update hero slides" ON public.hero_slides;
CREATE POLICY "Admins can update hero slides"
  ON public.hero_slides FOR UPDATE
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete hero slides" ON public.hero_slides;
CREATE POLICY "Admins can delete hero slides"
  ON public.hero_slides FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- hero_slideshow_settings
DROP POLICY IF EXISTS "Admins can insert slideshow settings" ON public.hero_slideshow_settings;
CREATE POLICY "Admins can insert slideshow settings"
  ON public.hero_slideshow_settings FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update slideshow settings" ON public.hero_slideshow_settings;
CREATE POLICY "Admins can update slideshow settings"
  ON public.hero_slideshow_settings FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- company_info
DROP POLICY IF EXISTS "Admins can insert company info" ON public.company_info;
CREATE POLICY "Admins can insert company info"
  ON public.company_info FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update company info" ON public.company_info;
CREATE POLICY "Admins can update company info"
  ON public.company_info FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- legal_config
DROP POLICY IF EXISTS "Only admins can read legal config" ON public.legal_config;
CREATE POLICY "Only admins can read legal config"
  ON public.legal_config FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Only admins can update legal config" ON public.legal_config;
CREATE POLICY "Only admins can update legal config"
  ON public.legal_config FOR UPDATE
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Only admins can insert legal config" ON public.legal_config;
CREATE POLICY "Only admins can insert legal config"
  ON public.legal_config FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- vacation_mode
DROP POLICY IF EXISTS "Admins can insert vacation mode" ON public.vacation_mode;
CREATE POLICY "Admins can insert vacation mode"
  ON public.vacation_mode FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update vacation mode" ON public.vacation_mode;
CREATE POLICY "Admins can update vacation mode"
  ON public.vacation_mode FOR UPDATE
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete vacation mode" ON public.vacation_mode;
CREATE POLICY "Admins can delete vacation mode"
  ON public.vacation_mode FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- page_texts
DROP POLICY IF EXISTS "Admin users can delete page texts" ON public.page_texts;
CREATE POLICY "Admin users can delete page texts"
  ON public.page_texts FOR DELETE
  TO authenticated
  USING (public.is_admin());