-- =============================================
-- BILLING FIX MIGRATION
-- Adds missing columns and ensures correct policies
-- =============================================

BEGIN;

-- 1. Add started_at column (when user first subscribed)
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;

-- 2. Add source_updated_at for webhook ordering protection
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS source_updated_at TIMESTAMPTZ;

-- 3. Ensure service role can INSERT into subscriptions (for webhooks)
-- Service role bypasses RLS by default, but let's also add explicit
-- policies for the webhook user if needed
DO $$
BEGIN
  -- Allow INSERT for authenticated service calls
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'subscriptions' 
    AND policyname = 'Service role can manage subscriptions'
  ) THEN
    CREATE POLICY "Service role can manage subscriptions"
      ON public.subscriptions
      FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- 4. Enable Realtime for subscriptions table
-- This is needed for the useSubscription hook to get live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriptions;

COMMIT;
