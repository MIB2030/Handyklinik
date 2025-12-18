/*
  # Entferne alte is_admin() Funktionen und ersetze mit check_is_admin()
  
  1. Problem
    - Alte is_admin() Funktionen verwenden user_roles Tabelle
    - user_roles hat RLS Policies die auf user_profiles verweisen
    - Dies verursacht Rekursion
  
  2. Lösung
    - Entferne alle alten is_admin() Funktionen
    - Stelle sicher dass nur check_is_admin() verwendet wird
    - check_is_admin() ist SECURITY DEFINER und greift direkt auf user_profiles zu
*/

-- Entferne alte is_admin() Funktionen
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.is_admin(uuid);

-- Erstelle is_admin() als Alias für check_is_admin() (für Kompatibilität)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT check_is_admin();
$$;

-- Erstelle is_admin(user_id) als Alias
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM user_profiles 
    WHERE id = user_id 
    AND role = 'admin'
  );
$$;

-- Entferne doppelte SELECT Policy für announcements
DROP POLICY IF EXISTS "Anonymous can view active announcements" ON public.announcements;
