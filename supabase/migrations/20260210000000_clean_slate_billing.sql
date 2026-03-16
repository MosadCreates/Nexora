-- =============================================
-- CLEAN SLATE BILLING MIGRATION (PRODUCTION)
-- =============================================
-- This migration removes all legacy billing logic and creates 
-- a robust, source-of-truth system for Polar.sh integration.

BEGIN;

-- 1. ENSURE PROFILES TABLE EXISTS
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  credits_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CLEAN UP PROFILES TABLE
-- Remove all inconsistent/legacy billing columns
ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS subscription_plan,
  DROP COLUMN IF EXISTS subscription_status,
  DROP COLUMN IF EXISTS subscription_billing_period,
  DROP COLUMN IF EXISTS subscription_end_date,
  DROP COLUMN IF EXISTS payment_subscription_id,
  DROP COLUMN IF EXISTS payment_customer_id,
  DROP COLUMN IF EXISTS cancel_at_period_end,
  DROP COLUMN IF EXISTS polar_customer_id,
  DROP COLUMN IF EXISTS polar_subscription_id;

-- Ensure standard columns exist
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS credits_used INTEGER DEFAULT 0;

-- 2. CREATE SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  polar_subscription_id TEXT UNIQUE,
  polar_customer_id TEXT,
  plan_slug TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'inactive',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT one_subscription_per_user UNIQUE (user_id)
);

-- 3. CREATE WEBHOOK EVENTS LOG
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ENABLE RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLICIES
-- Subscriptions: User can read their own
CREATE POLICY "Users can view own subscription" 
  ON public.subscriptions FOR SELECT 
  USING (auth.uid() = user_id);

-- Subscriptions: Service role (webhook) can do everything
-- (Handled by Supabase automatically with service_role key)

-- Profiles: User can read/update their own
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- 6. INDEXES
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_polar_id ON public.subscriptions(polar_subscription_id);

-- 7. FUNCTIONS
CREATE OR REPLACE FUNCTION public.increment_credits(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET credits_used = credits_used + 1
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
