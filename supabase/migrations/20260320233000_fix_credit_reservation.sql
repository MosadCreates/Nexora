-- Create a new function to pre-reserve a credit
CREATE OR REPLACE FUNCTION public.reserve_analysis_credit(
  p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_profile RECORD;
  v_subscription RECORD;
  v_plan_slug TEXT;
  v_max_credits INT;
BEGIN
  -- Security check
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Lock the profile row for atomic update
  SELECT * INTO v_profile
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

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

  -- Return the reservation token (plan at time of reservation)
  RETURN jsonb_build_object(
    'reserved', true,
    'plan_slug', v_plan_slug,
    'credits_used', v_profile.credits_used + 1,
    'max_credits', v_max_credits
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant only to service_role (called from API routes only)
REVOKE EXECUTE ON FUNCTION public.reserve_analysis_credit(UUID) 
FROM authenticated, public;
GRANT EXECUTE ON FUNCTION public.reserve_analysis_credit(UUID) 
TO service_role;

-- Create refund function for when analysis fails
CREATE OR REPLACE FUNCTION public.refund_analysis_credit(
  p_user_id UUID
) RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET credits_used = GREATEST(0, credits_used - 1),
      updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE EXECUTE ON FUNCTION public.refund_analysis_credit(UUID) 
FROM authenticated, public;
GRANT EXECUTE ON FUNCTION public.refund_analysis_credit(UUID) 
TO service_role;
