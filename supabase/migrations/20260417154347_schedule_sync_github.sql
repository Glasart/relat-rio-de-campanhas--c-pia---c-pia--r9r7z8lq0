CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA pg_catalog;

DO $$
BEGIN
  PERFORM cron.unschedule('sync-github-every-10-mins');
EXCEPTION WHEN OTHERS THEN
  -- ignore if schedule doesn't exist
END $$;

SELECT cron.schedule(
  'sync-github-every-10-mins',
  '*/10 * * * *',
  $
    SELECT net.http_post(
      url:='https://soenfmydetgzogueigtu.supabase.co/functions/v1/sync-github',
      headers:='{"Content-Type": "application/json"}'::jsonb
    )
  $
);
