/*
  # Ersetze alle is_admin() Aufrufe mit check_is_admin()
  
  1. Problem
    - Viele Policies verwenden noch is_admin() was zu Rekursion führt
    - is_admin() greift auf user_profiles zu, was RLS Policies hat
    
  2. Lösung
    - Ersetze alle is_admin() mit check_is_admin() (SECURITY DEFINER)
    - Dies umgeht RLS und verhindert Rekursion
*/

-- articles
DROP POLICY IF EXISTS "Admins can create articles" ON public.articles;
DROP POLICY IF EXISTS "Admins can update articles" ON public.articles;
DROP POLICY IF EXISTS "Admins can delete articles" ON public.articles;

CREATE POLICY "Admins can create articles"
  ON public.articles FOR INSERT
  TO authenticated
  WITH CHECK (check_is_admin());

CREATE POLICY "Admins can update articles"
  ON public.articles FOR UPDATE
  TO authenticated
  USING (check_is_admin())
  WITH CHECK (check_is_admin());

CREATE POLICY "Admins can delete articles"
  ON public.articles FOR DELETE
  TO authenticated
  USING (check_is_admin());

-- announcements SELECT policy
DROP POLICY IF EXISTS "View announcements" ON public.announcements;

CREATE POLICY "View announcements"
  ON public.announcements FOR SELECT
  TO anon, authenticated
  USING (is_active = true OR check_is_admin());

-- company_info
DROP POLICY IF EXISTS "Admins can insert company info" ON public.company_info;
DROP POLICY IF EXISTS "Admins can update company info" ON public.company_info;

CREATE POLICY "Admins can insert company info"
  ON public.company_info FOR INSERT
  TO authenticated
  WITH CHECK (check_is_admin());

CREATE POLICY "Admins can update company info"
  ON public.company_info FOR UPDATE
  TO authenticated
  USING (check_is_admin())
  WITH CHECK (check_is_admin());

-- content_sections
DROP POLICY IF EXISTS "Admins can insert content sections" ON public.content_sections;
DROP POLICY IF EXISTS "Admins can update content sections" ON public.content_sections;

CREATE POLICY "Admins can insert content sections"
  ON public.content_sections FOR INSERT
  TO authenticated
  WITH CHECK (check_is_admin());

CREATE POLICY "Admins can update content sections"
  ON public.content_sections FOR UPDATE
  TO authenticated
  USING (check_is_admin())
  WITH CHECK (check_is_admin());

-- faq_items
DROP POLICY IF EXISTS "Admins can insert FAQs" ON public.faq_items;
DROP POLICY IF EXISTS "Admins can update FAQs" ON public.faq_items;
DROP POLICY IF EXISTS "Admins can delete FAQs" ON public.faq_items;

CREATE POLICY "Admins can insert FAQs"
  ON public.faq_items FOR INSERT
  TO authenticated
  WITH CHECK (check_is_admin());

CREATE POLICY "Admins can update FAQs"
  ON public.faq_items FOR UPDATE
  TO authenticated
  USING (check_is_admin())
  WITH CHECK (check_is_admin());

CREATE POLICY "Admins can delete FAQs"
  ON public.faq_items FOR DELETE
  TO authenticated
  USING (check_is_admin());

-- google_reviews
DROP POLICY IF EXISTS "Public can view visible reviews" ON public.google_reviews;
DROP POLICY IF EXISTS "Admins can insert reviews" ON public.google_reviews;
DROP POLICY IF EXISTS "Admins can update reviews" ON public.google_reviews;

CREATE POLICY "Public can view visible reviews"
  ON public.google_reviews FOR SELECT
  TO anon, authenticated
  USING (is_visible = true OR check_is_admin());

CREATE POLICY "Admins can insert reviews"
  ON public.google_reviews FOR INSERT
  TO authenticated
  WITH CHECK (check_is_admin());

CREATE POLICY "Admins can update reviews"
  ON public.google_reviews FOR UPDATE
  TO authenticated
  USING (check_is_admin())
  WITH CHECK (check_is_admin());

-- google_reviews_sync_log
DROP POLICY IF EXISTS "Admins can insert sync logs" ON public.google_reviews_sync_log;
DROP POLICY IF EXISTS "Admins can view sync logs" ON public.google_reviews_sync_log;

CREATE POLICY "Admins can insert sync logs"
  ON public.google_reviews_sync_log FOR INSERT
  TO authenticated
  WITH CHECK (check_is_admin());

CREATE POLICY "Admins can view sync logs"
  ON public.google_reviews_sync_log FOR SELECT
  TO authenticated
  USING (check_is_admin());

-- google_settings
DROP POLICY IF EXISTS "Admins can insert google settings" ON public.google_settings;
DROP POLICY IF EXISTS "Admins can update google settings" ON public.google_settings;

CREATE POLICY "Admins can insert google settings"
  ON public.google_settings FOR INSERT
  TO authenticated
  WITH CHECK (check_is_admin());

CREATE POLICY "Admins can update google settings"
  ON public.google_settings FOR UPDATE
  TO authenticated
  USING (check_is_admin())
  WITH CHECK (check_is_admin());

-- hero_slides
DROP POLICY IF EXISTS "Admins can insert hero slides" ON public.hero_slides;
DROP POLICY IF EXISTS "Admins can update hero slides" ON public.hero_slides;
DROP POLICY IF EXISTS "Admins can delete hero slides" ON public.hero_slides;

CREATE POLICY "Admins can insert hero slides"
  ON public.hero_slides FOR INSERT
  TO authenticated
  WITH CHECK (check_is_admin());

CREATE POLICY "Admins can update hero slides"
  ON public.hero_slides FOR UPDATE
  TO authenticated
  USING (check_is_admin())
  WITH CHECK (check_is_admin());

CREATE POLICY "Admins can delete hero slides"
  ON public.hero_slides FOR DELETE
  TO authenticated
  USING (check_is_admin());

-- hero_slideshow_settings
DROP POLICY IF EXISTS "Admins can insert slideshow settings" ON public.hero_slideshow_settings;
DROP POLICY IF EXISTS "Admins can update slideshow settings" ON public.hero_slideshow_settings;

CREATE POLICY "Admins can insert slideshow settings"
  ON public.hero_slideshow_settings FOR INSERT
  TO authenticated
  WITH CHECK (check_is_admin());

CREATE POLICY "Admins can update slideshow settings"
  ON public.hero_slideshow_settings FOR UPDATE
  TO authenticated
  USING (check_is_admin())
  WITH CHECK (check_is_admin());

-- legal_config
DROP POLICY IF EXISTS "Only admins can read legal config" ON public.legal_config;
DROP POLICY IF EXISTS "Only admins can insert legal config" ON public.legal_config;
DROP POLICY IF EXISTS "Only admins can update legal config" ON public.legal_config;

CREATE POLICY "Only admins can read legal config"
  ON public.legal_config FOR SELECT
  TO authenticated
  USING (check_is_admin());

CREATE POLICY "Only admins can insert legal config"
  ON public.legal_config FOR INSERT
  TO authenticated
  WITH CHECK (check_is_admin());

CREATE POLICY "Only admins can update legal config"
  ON public.legal_config FOR UPDATE
  TO authenticated
  USING (check_is_admin())
  WITH CHECK (check_is_admin());

-- page_texts
DROP POLICY IF EXISTS "Admin users can delete page texts" ON public.page_texts;

CREATE POLICY "Admin users can delete page texts"
  ON public.page_texts FOR DELETE
  TO authenticated
  USING (check_is_admin());

-- service_items
DROP POLICY IF EXISTS "Admins can insert services" ON public.service_items;
DROP POLICY IF EXISTS "Admins can update services" ON public.service_items;
DROP POLICY IF EXISTS "Admins can delete services" ON public.service_items;

CREATE POLICY "Admins can insert services"
  ON public.service_items FOR INSERT
  TO authenticated
  WITH CHECK (check_is_admin());

CREATE POLICY "Admins can update services"
  ON public.service_items FOR UPDATE
  TO authenticated
  USING (check_is_admin())
  WITH CHECK (check_is_admin());

CREATE POLICY "Admins can delete services"
  ON public.service_items FOR DELETE
  TO authenticated
  USING (check_is_admin());

-- testimonials
DROP POLICY IF EXISTS "Admins can insert testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can update testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can delete testimonials" ON public.testimonials;

CREATE POLICY "Admins can insert testimonials"
  ON public.testimonials FOR INSERT
  TO authenticated
  WITH CHECK (check_is_admin());

CREATE POLICY "Admins can update testimonials"
  ON public.testimonials FOR UPDATE
  TO authenticated
  USING (check_is_admin())
  WITH CHECK (check_is_admin());

CREATE POLICY "Admins can delete testimonials"
  ON public.testimonials FOR DELETE
  TO authenticated
  USING (check_is_admin());

-- vacation_mode
DROP POLICY IF EXISTS "Admins can insert vacation mode" ON public.vacation_mode;
DROP POLICY IF EXISTS "Admins can update vacation mode" ON public.vacation_mode;
DROP POLICY IF EXISTS "Admins can delete vacation mode" ON public.vacation_mode;

CREATE POLICY "Admins can insert vacation mode"
  ON public.vacation_mode FOR INSERT
  TO authenticated
  WITH CHECK (check_is_admin());

CREATE POLICY "Admins can update vacation mode"
  ON public.vacation_mode FOR UPDATE
  TO authenticated
  USING (check_is_admin())
  WITH CHECK (check_is_admin());

CREATE POLICY "Admins can delete vacation mode"
  ON public.vacation_mode FOR DELETE
  TO authenticated
  USING (check_is_admin());

-- voucher_downloads
DROP POLICY IF EXISTS "Admins can view download stats" ON public.voucher_downloads;

CREATE POLICY "Admins can view download stats"
  ON public.voucher_downloads FOR SELECT
  TO authenticated
  USING (check_is_admin());
