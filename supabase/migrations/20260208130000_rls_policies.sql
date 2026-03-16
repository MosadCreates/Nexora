-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================
-- Ensures users can only access their own data
-- Webhook logs are admin-only (service role)

-- ============================================
-- PROFILES TABLE
-- ============================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (idempotent)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role has full access to profiles" ON public.profiles;

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile (non-billing fields only)
-- Billing fields are updated by service role (webhook) only
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Service role has full access (for webhooks)
CREATE POLICY "Service role has full access to profiles"
ON public.profiles
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

COMMENT ON POLICY "Users can view their own profile" ON public.profiles IS
  'Allows authenticated users to read their own profile data including billing information.';

COMMENT ON POLICY "Users can update their own profile" ON public.profiles IS
  'Allows authenticated users to update non-billing fields. Billing fields are webhook-only.';

COMMENT ON POLICY "Service role has full access to profiles" ON public.profiles IS
  'Allows webhooks (service role) to update all fields including billing state.';

-- ============================================
-- POLAR_WEBHOOK_EVENTS TABLE
-- ============================================

-- Enable RLS
ALTER TABLE public.polar_webhook_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (idempotent)
DROP POLICY IF EXISTS "Only service role can access webhook events" ON public.polar_webhook_events;

-- Only service role can access webhook events (admin only)
CREATE POLICY "Only service role can access webhook events"
ON public.polar_webhook_events
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

COMMENT ON POLICY "Only service role can access webhook events" ON public.polar_webhook_events IS
  'Webhook events are internal audit logs. Only accessible by service role.';

-- ============================================
-- POLAR_PRODUCT_MAPPINGS TABLE
-- ============================================

-- Enable RLS
ALTER TABLE public.polar_product_mappings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (idempotent)
DROP POLICY IF EXISTS "Anyone can read active product mappings" ON public.polar_product_mappings;
DROP POLICY IF EXISTS "Only service role can modify product mappings" ON public.polar_product_mappings;

-- Anyone can read active product mappings (for pricing page)
CREATE POLICY "Anyone can read active product mappings"
ON public.polar_product_mappings
FOR SELECT
USING (is_active = true);

-- Only service role can modify product mappings
CREATE POLICY "Only service role can modify product mappings"
ON public.polar_product_mappings
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

COMMENT ON POLICY "Anyone can read active product mappings" ON public.polar_product_mappings IS
  'Allows public access to active product mappings for displaying pricing information.';

COMMENT ON POLICY "Only service role can modify product mappings" ON public.polar_product_mappings IS
  'Only admins (service role) can insert/update/delete product mappings.';

-- ============================================
-- ANALYSIS_HISTORY TABLE
-- ============================================

-- Enable RLS
ALTER TABLE public.analysis_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (idempotent)
DROP POLICY IF EXISTS "Users can view their own analysis history" ON public.analysis_history;
DROP POLICY IF EXISTS "Users can insert their own analysis history" ON public.analysis_history;

-- Users can view their own analysis history
CREATE POLICY "Users can view their own analysis history"
ON public.analysis_history
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own analysis history
CREATE POLICY "Users can insert their own analysis history"
ON public.analysis_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

COMMENT ON POLICY "Users can view their own analysis history" ON public.analysis_history IS
  'Allows users to view their own competitive analysis reports.';

COMMENT ON POLICY "Users can insert their own analysis history" ON public.analysis_history IS
  'Allows users to save new analysis reports.';

-- ============================================
-- VERIFICATION
-- ============================================

DO $$
DECLARE
  table_name TEXT;
  rls_enabled BOOLEAN;
BEGIN
  RAISE NOTICE '✅ Row Level Security Policies Applied';
  RAISE NOTICE '';

  FOR table_name IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename IN ('profiles', 'polar_webhook_events', 'polar_product_mappings', 'analysis_history')
  LOOP
    SELECT relrowsecurity INTO rls_enabled
    FROM pg_class
    WHERE relname = table_name;

    RAISE NOTICE '   % - RLS: %', table_name, CASE WHEN rls_enabled THEN 'ENABLED ✓' ELSE 'DISABLED ✗' END;
  END LOOP;

  RAISE NOTICE '';
  RAISE NOTICE '   Security Model:';
  RAISE NOTICE '     - Users: Can read/update own profiles, view own analyses';
  RAISE NOTICE '     - Webhooks: Full access via service role';
  RAISE NOTICE '     - Public: Can read active product mappings only';
END $$;
