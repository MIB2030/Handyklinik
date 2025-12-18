/*
  # Behebe user_profiles Rekursion mit SECURITY DEFINER Funktion
  
  1. Problem
    - user_profiles SELECT Policy prüft admin über user_roles View
    - user_roles View prüft admin über user_profiles Tabelle
    - Dies erzeugt eine Endlosrekursion
  
  2. Lösung
    - Erstelle eine SECURITY DEFINER Funktion die RLS umgeht
    - Verwende diese Funktion für alle Admin-Checks
    - Vereinfache user_profiles Policies (nur eigenes Profil sichtbar)
*/

-- Erstelle SECURITY DEFINER Funktion die RLS umgeht
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$;

-- Entferne alte user_profiles Policies
DROP POLICY IF EXISTS "Users can view own profile or admins view all" ON public.user_profiles;

-- Neue user_profiles SELECT Policy (nur eigenes Profil oder admin via SECURITY DEFINER)
CREATE POLICY "Users can view profiles"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() 
    OR check_is_admin()
  );

-- Update user_roles View Policy to use check_is_admin()
DROP POLICY IF EXISTS "View roles" ON public.user_roles;

CREATE POLICY "Users can view roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR check_is_admin()
  );

-- Update andere Policies die is_admin() verwenden
DROP POLICY IF EXISTS "Admins can delete vouchers" ON public.vouchers;
DROP POLICY IF EXISTS "Update vouchers policy" ON public.vouchers;

CREATE POLICY "Admins can delete vouchers"
  ON public.vouchers
  FOR DELETE
  TO authenticated
  USING (check_is_admin());

CREATE POLICY "Admins can update vouchers"
  ON public.vouchers
  FOR UPDATE
  TO authenticated
  USING (
    check_is_admin() 
    OR (status = 'active' AND is_redeemed = false AND printed_at IS NULL)
  )
  WITH CHECK (
    check_is_admin() 
    OR (printed_at IS NOT NULL AND status = 'active' AND is_redeemed = false)
  );

-- Update announcements policies
DROP POLICY IF EXISTS "Admins can manage announcements" ON public.announcements;
DROP POLICY IF EXISTS "Admins can create announcements" ON public.announcements;
DROP POLICY IF EXISTS "Admins can delete announcements" ON public.announcements;
DROP POLICY IF EXISTS "Admins can update announcements" ON public.announcements;

CREATE POLICY "Admins can insert announcements"
  ON public.announcements
  FOR INSERT
  TO authenticated
  WITH CHECK (check_is_admin());

CREATE POLICY "Admins can update announcements"
  ON public.announcements
  FOR UPDATE
  TO authenticated
  USING (check_is_admin())
  WITH CHECK (check_is_admin());

CREATE POLICY "Admins can delete announcements"
  ON public.announcements
  FOR DELETE
  TO authenticated
  USING (check_is_admin());

-- Update user_roles policies
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

CREATE POLICY "Admins can insert roles"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (check_is_admin());

CREATE POLICY "Admins can update roles"
  ON public.user_roles
  FOR UPDATE
  TO authenticated
  USING (check_is_admin())
  WITH CHECK (check_is_admin());

CREATE POLICY "Admins can delete roles"
  ON public.user_roles
  FOR DELETE
  TO authenticated
  USING (check_is_admin());
