-- =============================================
-- FIX #11 (Audit 2): Add Missing RLS Policies
-- =============================================
-- Adds INSERT/DELETE policies for profiles and
-- DELETE policy for analysis_history.

BEGIN;

-- ─────────────────────────────────────────────
-- PROFILES: Allow users to insert their own profile
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- ─────────────────────────────────────────────
-- PROFILES: Allow users to delete their own profile
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
CREATE POLICY "Users can delete own profile"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- ─────────────────────────────────────────────
-- ANALYSIS_HISTORY: Allow users to delete their own history
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can delete own analysis history" ON public.analysis_history;
CREATE POLICY "Users can delete own analysis history"
  ON public.analysis_history
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- ANALYSIS_HISTORY: Service role full access (for admin operations)
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "Service role full access on analysis_history" ON public.analysis_history;
CREATE POLICY "Service role full access on analysis_history"
  ON public.analysis_history
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

COMMIT;
