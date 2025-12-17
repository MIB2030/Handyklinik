/*
  # Fix Remaining Security Issues

  1. Changes
    - Fix critical bug in user_profiles SELECT policy (user_roles.user_id = user_roles.id should be user_roles.user_id = auth.uid())
    - Ensure all policies use (SELECT auth.uid()) consistently
    - Clean up any remaining multiple policies
    
  2. Security
    - Fixes broken admin check in user_profiles
    - Optimizes auth.uid() calls
*/

-- Fix the broken SELECT policy on user_profiles
DROP POLICY IF EXISTS "Users can view own profile or admins view all" ON user_profiles;

CREATE POLICY "Users can view own profile or admins view all"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    id = (SELECT auth.uid()) 
    OR 
    EXISTS (
      SELECT 1
      FROM user_roles
      WHERE user_roles.user_id = (SELECT auth.uid()) 
      AND user_roles.role = 'admin'
    )
  );

-- Ensure INSERT policy is correct
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = (SELECT auth.uid()));

-- Ensure UPDATE policy is correct
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));
