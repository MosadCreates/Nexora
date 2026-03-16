-- ============================================
-- CLEAN BILLING SCHEMA
-- ============================================
-- This migration removes all inconsistencies and creates
-- a minimal, production-ready billing system
--
-- Run AFTER 20260208100000_backup_billing_data.sql

-- ============================================
-- STEP 1: Clean up profiles table
-- ============================================

-- Drop all deprecated/unused billing columns
ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS polar_customer_id,
  DROP COLUMN IF EXISTS polar_subscription_id,
  DROP COLUMN IF EXISTS polar_product_id,
  DROP COLUMN IF EXISTS polar_price_id,
  DROP COLUMN IF EXISTS billing_period,
  DROP COLUMN IF EXISTS subscription_start_date,
  DROP COLUMN IF EXISTS trial_end_date,
  DROP COLUMN IF EXISTS canceled_at,
  DROP COLUMN IF EXISTS last_webhook_at,
  DROP COLUMN IF EXISTS legacy_billing_data,
  DROP COLUMN IF EXISTS is_pro;

-- Ensure correct column names exist with proper types
-- These may already exist from previous migrations - using IF NOT EXISTS pattern

DO $$
BEGIN
  -- payment_customer_id (Polar customer UUID)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'payment_customer_id'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN payment_customer_id UUID;
  END IF;

  -- payment_subscription_id (Polar subscription UUID)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'payment_subscription_id'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN payment_subscription_id UUID;
  END IF;

  -- subscription_billing_period
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subscription_billing_period'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN subscription_billing_period TEXT;
  END IF;

  -- subscription_end_date
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subscription_end_date'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN subscription_end_date TIMESTAMPTZ;
  END IF;
END $$;

-- Ensure subscription_plan exists with correct default
ALTER TABLE public.profiles
  ALTER COLUMN subscription_plan SET DEFAULT 'hobby',
  ALTER COLUMN subscription_plan SET NOT NULL;

-- Ensure cancel_at_period_end exists with correct default
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'cancel_at_period_end'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN cancel_at_period_end BOOLEAN DEFAULT false NOT NULL;
  ELSE
    ALTER TABLE public.profiles
      ALTER COLUMN cancel_at_period_end SET DEFAULT false,
      ALTER COLUMN cancel_at_period_end SET NOT NULL;
  END IF;
END $$;

-- Drop and recreate constraints to ensure consistency
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS valid_subscription_plan;
ALTER TABLE public.profiles ADD CONSTRAINT valid_subscription_plan
  CHECK (subscription_plan IN ('hobby', 'starter', 'professional', 'enterprise'));

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS valid_billing_period;
ALTER TABLE public.profiles ADD CONSTRAINT valid_billing_period
  CHECK (subscription_billing_period IS NULL OR subscription_billing_period IN ('monthly', 'yearly'));

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS valid_subscription_status;
ALTER TABLE public.profiles ADD CONSTRAINT valid_subscription_status
  CHECK (subscription_status IS NULL OR subscription_status IN ('active', 'canceled', 'past_due', 'incomplete', 'trialing'));

-- Add unique constraints for Polar IDs
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_payment_customer_id
  ON public.profiles(payment_customer_id)
  WHERE payment_customer_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_payment_subscription_id
  ON public.profiles(payment_subscription_id)
  WHERE payment_subscription_id IS NOT NULL;

-- Add index for plan queries
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_plan
  ON public.profiles(subscription_plan);

-- Update column comments
COMMENT ON COLUMN public.profiles.payment_customer_id IS
  'Polar customer UUID. NULL for users who have never made a payment.';

COMMENT ON COLUMN public.profiles.payment_subscription_id IS
  'Polar subscription UUID. NULL for hobby/free users.';

COMMENT ON COLUMN public.profiles.subscription_plan IS
  'Current subscription plan: hobby (free), starter, professional, or enterprise. Single source of truth.';

COMMENT ON COLUMN public.profiles.subscription_status IS
  'Subscription status from Polar: active, canceled, past_due, incomplete, trialing. NULL for hobby users.';

COMMENT ON COLUMN public.profiles.subscription_billing_period IS
  'Billing period: monthly or yearly. NULL for hobby users.';

COMMENT ON COLUMN public.profiles.cancel_at_period_end IS
  'Whether subscription will cancel at end of current period. Set by user cancellation.';

COMMENT ON COLUMN public.profiles.subscription_end_date IS
  'Current period end date (from Polar). NULL for hobby users or never-subscribed users.';

-- ============================================
-- STEP 2: Clean up webhook tables
-- ============================================

-- Drop the duplicate webhook table
DROP TABLE IF EXISTS public.polar_webhook_logs CASCADE;

-- Ensure polar_webhook_events exists with correct schema
CREATE TABLE IF NOT EXISTS public.polar_webhook_events (
  event_id TEXT PRIMARY KEY,           -- Polar's event.id - ensures idempotency
  event_type TEXT NOT NULL,            -- e.g., "subscription.created"
  payload JSONB NOT NULL,              -- Full webhook payload for debugging
  processed_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add index for querying by type and time
CREATE INDEX IF NOT EXISTS idx_polar_webhook_events_type
  ON public.polar_webhook_events(event_type);

CREATE INDEX IF NOT EXISTS idx_polar_webhook_events_processed_at
  ON public.polar_webhook_events(processed_at DESC);

-- Enable RLS (only service role can write)
ALTER TABLE public.polar_webhook_events ENABLE ROW LEVEL SECURITY;

-- No public policies - only service role access
COMMENT ON TABLE public.polar_webhook_events IS
  'Webhook event log for idempotency and audit trail. Only accessible by service role.';

-- ============================================
-- STEP 3: Ensure polar_product_mappings is correct
-- ============================================

-- Table already exists from previous migration
-- Just ensure it has proper indexes and constraints

-- Add updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'polar_product_mappings' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.polar_product_mappings
      ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;
  END IF;
END $$;

-- Add trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS update_polar_product_mappings_updated_at ON public.polar_product_mappings;
CREATE TRIGGER update_polar_product_mappings_updated_at
  BEFORE UPDATE ON public.polar_product_mappings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- STEP 4: Data cleanup
-- ============================================

-- Reset any users with invalid state
UPDATE public.profiles
SET
  subscription_plan = 'hobby',
  subscription_status = NULL,
  subscription_billing_period = NULL,
  payment_subscription_id = NULL,
  subscription_end_date = NULL,
  cancel_at_period_end = false
WHERE subscription_plan IN ('starter', 'professional', 'enterprise')
  AND (payment_subscription_id IS NULL OR subscription_status IS NULL);

-- ============================================
-- FINAL VERIFICATION
-- ============================================

DO $$
DECLARE
  profile_count INT;
  hobbycount INT;
  paid_count INT;
BEGIN
  SELECT COUNT(*) INTO profile_count FROM public.profiles;
  SELECT COUNT(*) INTO hobby_count FROM public.profiles WHERE subscription_plan = 'hobby';
  SELECT COUNT(*) INTO paid_count FROM public.profiles WHERE subscription_plan IN ('starter', 'professional', 'enterprise');

  RAISE NOTICE '✅ Clean billing schema migration complete';
  RAISE NOTICE '   Total profiles: %', profile_count;
  RAISE NOTICE '   Hobby users: %', hobby_count;
  RAISE NOTICE '   Paid users: %', paid_count;
  RAISE NOTICE '';
  RAISE NOTICE '   Removed columns: polar_*, billing_period, subscription_start_date, trial_end_date, canceled_at, last_webhook_at, legacy_billing_data, is_pro';
  RAISE NOTICE '   Removed table: polar_webhook_logs';
  RAISE NOTICE '   Single webhook table: polar_webhook_events';
END $$;
