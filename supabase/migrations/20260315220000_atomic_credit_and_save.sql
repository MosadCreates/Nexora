-- =============================================
-- ATOMIC CREDIT DECREMENT + ANALYSIS SAVE — Fix #8
-- =============================================
-- This function atomically:
--   1. Checks the user has remaining credits
--   2. Decrements credits_used by 1
--   3. Inserts the analysis into analysis_history
--   4. Returns the new analysis record
-- All inside a single transaction (implicit in plpgsql).

BEGIN;

CREATE OR REPLACE FUNCTION public.save_analysis_atomically(
  p_user_id UUID,
  p_query_text TEXT,
  p_analysis_result JSONB
)
RETURNS JSONB AS $$
DECLARE
  v_credits_used INTEGER;
  v_max_credits INTEGER;
  v_plan_slug TEXT;
  v_new_record JSONB;
  v_record_id UUID;
BEGIN
  -- 1. Lock the profile row to prevent concurrent credit races
  SELECT credits_used INTO v_credits_used
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found for user %', p_user_id;
  END IF;

  -- 2. Get the user's plan to determine max credits
  SELECT COALESCE(s.plan_slug, 'hobby') INTO v_plan_slug
  FROM public.subscriptions s
  WHERE s.user_id = p_user_id
    AND s.status IN ('active', 'trialing')
  LIMIT 1;

  IF v_plan_slug IS NULL THEN
    v_plan_slug := 'hobby';
  END IF;

  -- Map plan to max credits
  v_max_credits := CASE v_plan_slug
    WHEN 'hobby' THEN 3
    WHEN 'starter' THEN 20
    WHEN 'professional' THEN 60
    WHEN 'enterprise' THEN 500
    ELSE 3
  END;

  -- 3. Check credits
  IF v_credits_used >= v_max_credits THEN
    RAISE EXCEPTION 'NO_CREDITS_REMAINING';
  END IF;

  -- 4. Decrement credits (increment credits_used)
  UPDATE public.profiles
  SET credits_used = credits_used + 1
  WHERE id = p_user_id;

  -- 5. Insert analysis history
  INSERT INTO public.analysis_history (user_id, query, report)
  VALUES (p_user_id, p_query_text, p_analysis_result)
  RETURNING id INTO v_record_id;

  -- 6. Build return value
  v_new_record := jsonb_build_object(
    'id', v_record_id,
    'user_id', p_user_id,
    'query', p_query_text,
    'credits_used', v_credits_used + 1,
    'max_credits', v_max_credits
  );

  RETURN v_new_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users (through RLS + service role)
GRANT EXECUTE ON FUNCTION public.save_analysis_atomically(UUID, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_analysis_atomically(UUID, TEXT, JSONB) TO service_role;

COMMIT;
