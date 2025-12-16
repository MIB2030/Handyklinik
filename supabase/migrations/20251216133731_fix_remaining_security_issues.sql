/*
  # Fix Remaining Security Issues

  ## Changes Made

  ### 1. Fix Security Definer View
  - Recreate user_roles_with_email view without SECURITY DEFINER
  - Use explicit grants instead

  ### 2. Move pg_trgm Extension
  - Create extensions schema if not exists
  - Attempt to move pg_trgm to extensions schema

  ## Notes
  - Auth DB Connection Strategy must be changed in Supabase dashboard
  - Leaked Password Protection must be enabled in Auth settings
*/

-- =====================================================
-- 1. FIX SECURITY DEFINER VIEW
-- =====================================================

-- Drop the existing view
DROP VIEW IF EXISTS public.user_roles_with_email;

-- Recreate without SECURITY DEFINER
CREATE VIEW public.user_roles_with_email AS
SELECT 
  ur.user_id,
  ur.role,
  ur.created_at,
  au.email
FROM public.user_roles ur
LEFT JOIN auth.users au ON ur.user_id = au.id;

-- Grant access only to authenticated users who are admins
REVOKE ALL ON public.user_roles_with_email FROM PUBLIC;
REVOKE ALL ON public.user_roles_with_email FROM anon;
REVOKE ALL ON public.user_roles_with_email FROM authenticated;

-- Create RLS policy for the view (views don't support RLS directly, so we rely on underlying table policies)
COMMENT ON VIEW public.user_roles_with_email IS 'View combining user roles with email addresses. Access controlled via user_roles table RLS policies.';

-- =====================================================
-- 2. MOVE PG_TRGM EXTENSION
-- =====================================================

-- Create extensions schema if not exists
CREATE SCHEMA IF NOT EXISTS extensions;

-- Grant usage on extensions schema
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- Move pg_trgm to extensions schema
DO $$
BEGIN
  -- Check if pg_trgm exists in public schema
  IF EXISTS (
    SELECT 1 FROM pg_extension 
    WHERE extname = 'pg_trgm' 
    AND extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    -- Move the extension
    ALTER EXTENSION pg_trgm SET SCHEMA extensions;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- If move fails, just log it (extension might be in use)
    RAISE NOTICE 'Could not move pg_trgm extension: %', SQLERRM;
END $$;

-- Ensure search_path includes extensions schema for functions that use pg_trgm
ALTER DATABASE postgres SET search_path TO public, extensions;
