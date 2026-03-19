-- Fix #10: Ensure webhook_events table has all required columns
-- These columns are written by the webhook handler but may not
-- exist in the original schema.

BEGIN;

-- Add missing columns if they don't exist
ALTER TABLE public.webhook_events
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'processing',
  ADD COLUMN IF NOT EXISTS error_message TEXT,
  ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ;

-- Add index for faster duplicate lookups
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id
  ON public.webhook_events(event_id);

-- Add index for status queries (useful for monitoring/debugging)
CREATE INDEX IF NOT EXISTS idx_webhook_events_status
  ON public.webhook_events(status);

COMMIT;
