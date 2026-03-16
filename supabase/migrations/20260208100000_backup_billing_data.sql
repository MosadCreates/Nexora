-- ============================================
-- SAFETY BACKUP: Billing Data
-- ============================================
-- This migration backs up ALL current billing state before cleanup
-- Can be used for rollback if needed
-- DO NOT DELETE THIS TABLE

-- Backup current billing state
CREATE TABLE IF NOT EXISTS public.profiles_billing_backup_20260208 AS
SELECT
  id,
  email,
  first_name,
  last_name,
  credits_used,
  is_pro,
  created_at,

  -- All billing-related fields (even deprecated ones)
  subscription_plan,
  subscription_status,
  subscription_billing_period,
  billing_period,
  payment_subscription_id,
  payment_customer_id,
  polar_subscription_id,
  polar_customer_id,
  polar_product_id,
  polar_price_id,
  subscription_start_date,
  subscription_end_date,
  trial_end_date,
  cancel_at_period_end,
  canceled_at,
  last_webhook_at,
  legacy_billing_data
FROM public.profiles;

-- Add metadata
COMMENT ON TABLE public.profiles_billing_backup_20260208 IS
  'BACKUP created before clean billing system rebuild on 2026-02-08. DO NOT DELETE.';

-- Create index on id for fast lookups
CREATE INDEX idx_billing_backup_20260208_id
  ON public.profiles_billing_backup_20260208(id);

-- Log backup completion
DO $$
DECLARE
  row_count INT;
BEGIN
  SELECT COUNT(*) INTO row_count FROM public.profiles_billing_backup_20260208;
  RAISE NOTICE '✅ Backed up % user profiles to profiles_billing_backup_20260208', row_count;
END $$;
