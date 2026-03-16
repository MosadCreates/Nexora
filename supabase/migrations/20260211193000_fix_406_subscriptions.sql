-- Migration: Fix 406 Not Acceptable on Subscriptions
-- Description: Re-applies RLS and notifies PostgREST to reload schema cache

BEGIN;

-- 1. Re-enable RLS (idempotent)
ALTER TABLE IF EXISTS public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 2. Re-apply Select Policy
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
CREATE POLICY "Users can view own subscription" 
  ON public.subscriptions FOR SELECT 
  USING (auth.uid() = user_id);

-- 3. Ensure service role has access
DROP POLICY IF EXISTS "Service role full access on subscriptions" ON public.subscriptions;
CREATE POLICY "Service role full access on subscriptions"
  ON public.subscriptions FOR ALL
  USING (auth.role() = 'service_role');

-- 4. Reload Schema Cache
NOTIFY pgrst, 'reload schema';

COMMIT;
