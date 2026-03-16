-- Fix default values for subscription fields
-- This ensures all fields have correct defaults for new users

-- Set proper defaults for subscription fields
ALTER TABLE public.profiles
ALTER COLUMN subscription_status DROP DEFAULT;

ALTER TABLE public.profiles
ALTER COLUMN subscription_billing_period DROP DEFAULT;

ALTER TABLE public.profiles
ALTER COLUMN subscription_end_date DROP DEFAULT;

ALTER TABLE public.profiles
ALTER COLUMN payment_subscription_id DROP DEFAULT;

ALTER TABLE public.profiles
ALTER COLUMN payment_customer_id DROP DEFAULT;

ALTER TABLE public.profiles
ALTER COLUMN cancel_at_period_end SET DEFAULT false;

-- Fix any users who have empty string for payment_subscription_id
UPDATE public.profiles
SET payment_subscription_id = NULL
WHERE payment_subscription_id = '';

-- Fix users who have 'active' status but no actual subscription
-- (These are likely test users or users with incorrect data)
UPDATE public.profiles
SET subscription_status = NULL
WHERE subscription_status = 'active'
  AND (payment_subscription_id IS NULL OR payment_subscription_id = '')
  AND subscription_plan = 'hobby';

-- Update users who have professional/starter/enterprise plan but no payment info
-- They should be downgraded to hobby
UPDATE public.profiles
SET
  subscription_plan = 'hobby',
  subscription_status = NULL,
  subscription_billing_period = NULL
WHERE subscription_plan IN ('starter', 'professional', 'enterprise')
  AND (payment_subscription_id IS NULL OR payment_subscription_id = '')
  AND (payment_customer_id IS NULL OR payment_customer_id = '');

-- Add comments
COMMENT ON COLUMN public.profiles.subscription_status IS 'Current subscription status from payment provider (active, canceled, past_due, incomplete). NULL for free users.';
COMMENT ON COLUMN public.profiles.payment_subscription_id IS 'Payment provider subscription ID. NULL for free users.';
COMMENT ON COLUMN public.profiles.payment_customer_id IS 'Payment provider customer ID. NULL until first payment.';
