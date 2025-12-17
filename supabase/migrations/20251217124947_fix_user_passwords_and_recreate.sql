/*
  # Fix User Passwords and Recreate Users

  1. Changes
    - Delete existing users completely
    - Recreate moritz and marc with correct password hashing
    - Ensure login works correctly
  
  2. Security
    - Password is hashed with bcrypt
    - Users have admin role
*/

-- Delete all existing users
DO $$
DECLARE
  user_record RECORD;
BEGIN
  -- Delete from user_profiles first
  DELETE FROM public.user_profiles;
  
  -- Delete from auth.users
  FOR user_record IN SELECT id FROM auth.users LOOP
    DELETE FROM auth.users WHERE id = user_record.id;
  END LOOP;
END $$;

-- Create user moritz with proper password
DO $$
DECLARE
  v_user_id uuid := gen_random_uuid();
  v_encrypted_password text;
BEGIN
  -- Hash the password properly
  v_encrypted_password := crypt('Aspire5536', gen_salt('bf'));
  
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_user_id,
    'authenticated',
    'authenticated',
    'moritz@admin.local',
    v_encrypted_password,
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"vorname":"Moritz"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  -- Create profile
  INSERT INTO public.user_profiles (
    id,
    username,
    vorname,
    nachname,
    role
  ) VALUES (
    v_user_id,
    'moritz',
    'Moritz',
    'Admin',
    'admin'
  );
END $$;

-- Create user marc with proper password
DO $$
DECLARE
  v_user_id uuid := gen_random_uuid();
  v_encrypted_password text;
BEGIN
  -- Hash the password properly
  v_encrypted_password := crypt('Aspire5536', gen_salt('bf'));
  
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_user_id,
    'authenticated',
    'authenticated',
    'marc@admin.local',
    v_encrypted_password,
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"vorname":"Marc"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  -- Create profile
  INSERT INTO public.user_profiles (
    id,
    username,
    vorname,
    nachname,
    role
  ) VALUES (
    v_user_id,
    'marc',
    'Marc',
    'Admin',
    'admin'
  );
END $$;
