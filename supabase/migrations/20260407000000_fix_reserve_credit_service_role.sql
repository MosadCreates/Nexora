-- Fix reserve_analysis_credit: remove auth.uid() check that always fails
-- when called via service_role (auth.uid() is NULL with service role JWT).
-- Security is maintained by: GRANT service_role only + API route user validation.
CREATE OR REPLACE FUNCTION public.reserve_analysis_credit(
  p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_profile RECORD;
  v_subscription RECORD;
  v_plan_slug TEXT;
  v_max_credits INT;
BEGIN
  -- Lock the profile row for atomic update
  SELECT * INTO v_profile
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  -- Get subscription (capture status at THIS moment)
  SELECT * INTO v_subscription
  FROM public.subscriptions
  WHERE user_id = p_user_id
    AND status IN ('active', 'trialing')
  LIMIT 1;

  -- Determine plan
  v_plan_slug := COALESCE(v_subscription.plan_slug, 'hobby');

  v_max_credits := CASE v_plan_slug
    WHEN 'hobby' THEN 3
    WHEN 'starter' THEN 20
    WHEN 'professional' THEN 60
    WHEN 'enterprise' THEN 500
    ELSE 3
  END;

  -- Check credits
  IF v_profile.credits_used >= v_max_credits THEN
    RAISE EXCEPTION 'NO_CREDITS_REMAINING';
  END IF;

  -- PRE-DECREMENT: Reserve the credit NOW
  UPDATE public.profiles
  SET credits_used = credits_used + 1,
      updated_at = NOW()
  WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'reserved', true,
    'plan_slug', v_plan_slug,
    'credits_used', v_profile.credits_used + 1,
    'max_credits', v_max_credits
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Keep restricted to service_role only (called from server API routes only)
REVOKE EXECUTE ON FUNCTION public.reserve_analysis_credit(UUID)
FROM authenticated, public;
GRANT EXECUTE ON FUNCTION public.reserve_analysis_credit(UUID)
TO service_role;
