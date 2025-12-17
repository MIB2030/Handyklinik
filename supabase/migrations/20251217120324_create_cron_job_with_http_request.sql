/*
  # Automatischer Cron Job für Google Reviews mit HTTP Request
  
  1. Änderungen
    - Aktiviert pg_cron und pg_net Extensions
    - Erstellt einen täglichen Cron Job (täglich um 2:00 Uhr morgens)
    - Der Cron Job ruft die Edge Function via HTTP auf
  
  2. Funktionsweise
    - Läuft automatisch alle 24 Stunden
    - Prüft ob Auto-Sync aktiviert ist
    - Ruft Edge Function mit triggeredBy='cron' auf
    - Nur neue Reviews werden hinzugefügt (keine Duplikate)
  
  3. Wichtig
    - Stellen Sie sicher, dass die Google API-Einstellungen konfiguriert sind
    - Aktivieren Sie Auto-Sync im Admin-Bereich unter "Google Einstellungen"
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create function to trigger Edge Function via HTTP
CREATE OR REPLACE FUNCTION trigger_google_reviews_sync_http()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_settings RECORD;
  v_request_id bigint;
  v_function_url text;
  v_anon_key text;
BEGIN
  -- Get settings
  SELECT auto_sync_enabled
  INTO v_settings
  FROM google_settings
  WHERE id = '00000000-0000-0000-0000-000000000001';

  -- Check if auto sync is enabled
  IF NOT FOUND OR v_settings.auto_sync_enabled = FALSE THEN
    RETURN;
  END IF;

  -- Get Supabase URL and construct function URL
  v_function_url := current_setting('app.settings.supabase_url', true) || '/functions/v1/sync-google-reviews';
  v_anon_key := current_setting('app.settings.supabase_anon_key', true);

  -- Make HTTP request to Edge Function
  SELECT net.http_post(
    url := v_function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_anon_key
    ),
    body := jsonb_build_object(
      'triggeredBy', 'cron'
    )
  ) INTO v_request_id;

EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail
    RAISE WARNING 'Error triggering Google Reviews sync: %', SQLERRM;
END;
$$;

-- Remove existing cron job if it exists
SELECT cron.unschedule('google-reviews-daily-sync')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'google-reviews-daily-sync'
);

-- Schedule the cron job to run daily at 2:00 AM
SELECT cron.schedule(
  'google-reviews-daily-sync',
  '0 2 * * *',
  'SELECT trigger_google_reviews_sync_http();'
);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION trigger_google_reviews_sync_http() TO postgres;
GRANT USAGE ON SCHEMA net TO postgres;
