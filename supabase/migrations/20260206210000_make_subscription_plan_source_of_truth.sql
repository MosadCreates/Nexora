-- Migration: Make subscription_plan the single source of truth for plan status
-- This replaces the binary is_pro boolean with the proper subscription_plan column

-- Step 1: Migrate existing is_pro=true users who don't have a subscription_plan set
UPDATE public.profiles
SET subscription_plan = 'professional'
WHERE is_pro = true AND (subscription_plan IS NULL OR subscription_plan = '');

-- Step 2: Set all users without a subscription_plan to 'hobby'
UPDATE public.profiles
SET subscription_plan = 'hobby'
WHERE subscription_plan IS NULL OR subscription_plan = '';

-- Step 3: Set default value for subscription_plan so new rows always get 'hobby'
ALTER TABLE public.profiles
ALTER COLUMN subscription_plan SET DEFAULT 'hobby';

-- Step 4: Make subscription_plan NOT NULL now that all rows have a value
-- This is idempotent - if already NOT NULL, this is a no-op
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles'
    AND column_name = 'subscription_plan'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.profiles ALTER COLUMN subscription_plan SET NOT NULL;
  END IF;
END $$;

-- Step 5: Add a CHECK constraint to ensure only valid plans are stored
-- Drop first if exists to make migration idempotent
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS valid_subscription_plan;
ALTER TABLE public.profiles
ADD CONSTRAINT valid_subscription_plan
CHECK (subscription_plan IN ('hobby', 'starter', 'professional', 'enterprise'));

-- Step 6: Add a CHECK constraint for billing period
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS valid_billing_period;
ALTER TABLE public.profiles
ADD CONSTRAINT valid_billing_period
CHECK (subscription_billing_period IS NULL OR subscription_billing_period IN ('monthly', 'yearly'));

-- Step 7: Add a CHECK constraint for subscription status
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS valid_subscription_status;
ALTER TABLE public.profiles
ADD CONSTRAINT valid_subscription_status
CHECK (subscription_status IS NULL OR subscription_status IN ('active', 'canceled', 'past_due', 'incomplete'));

-- Add comments documenting the change
COMMENT ON COLUMN public.profiles.subscription_plan IS 'The subscription tier: hobby (default/free), starter, professional, or enterprise. This is the single source of truth for plan status.';
COMMENT ON COLUMN public.profiles.is_pro IS 'DEPRECATED - Use subscription_plan instead. Kept for backward compatibility during migration.';
