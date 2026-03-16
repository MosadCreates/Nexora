-- =============================================
-- COMPOSITE INDEXES — Fix #13
-- =============================================
-- Improves query performance for common access patterns.

-- Composite index for the cancel-subscription query pattern:
--   .eq('user_id', user.id).eq('status', 'active')
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status
  ON public.subscriptions (user_id, status);

-- Index for email lookups on profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email
  ON public.profiles (email);

-- Index for analysis_history ordered queries by user
CREATE INDEX IF NOT EXISTS idx_analysis_history_user_created
  ON public.analysis_history (user_id, created_at DESC);
