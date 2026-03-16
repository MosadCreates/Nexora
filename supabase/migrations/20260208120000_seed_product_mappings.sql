-- ============================================
-- SEED PRODUCT MAPPINGS
-- ============================================
-- Maps Polar product/price IDs to internal plans
-- This allows webhooks to resolve plans without hardcoding
--
-- Product IDs from .env.local:
-- Starter Monthly:  764931a3-d475-4cdc-af6a-9e07392dd6f1
-- Starter Yearly:   42d90518-8900-47ef-9e0a-e3ec318814a9
-- Pro Monthly:      dbe9f58f-fca2-4926-b1b9-1572f268ff04
-- Pro Yearly:       bddc5277-1bec-4f9d-8024-0c3b2837a2ac

-- Clear existing mappings (idempotent)
TRUNCATE TABLE public.polar_product_mappings;

-- ============================================
-- STARTER TIER
-- ============================================

-- Starter Monthly
INSERT INTO public.polar_product_mappings (
  polar_product_id,
  polar_price_id,
  plan,
  billing_period,
  display_name,
  description,
  features,
  is_active
) VALUES (
  '764931a3-d475-4cdc-af6a-9e07392dd6f1'::UUID,
  '764931a3-d475-4cdc-af6a-9e07392dd6f1'::UUID,
  'starter',
  'month',
  'Starter Monthly',
  'Perfect for small teams and emerging startups - billed monthly',
  '{
    "analyses_per_month": 50,
    "api_access": true,
    "deep_sentiment": true,
    "market_alerts": true,
    "export_reports": true,
    "support": "standard"
  }'::JSONB,
  true
);

-- Starter Yearly
INSERT INTO public.polar_product_mappings (
  polar_product_id,
  polar_price_id,
  plan,
  billing_period,
  display_name,
  description,
  features,
  is_active
) VALUES (
  '42d90518-8900-47ef-9e0a-e3ec318814a9'::UUID,
  '42d90518-8900-47ef-9e0a-e3ec318814a9'::UUID,
  'starter',
  'year',
  'Starter Yearly',
  'Perfect for small teams and emerging startups - billed annually',
  '{
    "analyses_per_month": 50,
    "api_access": true,
    "deep_sentiment": true,
    "market_alerts": true,
    "export_reports": true,
    "support": "standard",
    "discount": "2 months free"
  }'::JSONB,
  true
);

-- ============================================
-- PROFESSIONAL TIER
-- ============================================

-- Professional Monthly
INSERT INTO public.polar_product_mappings (
  polar_product_id,
  polar_price_id,
  plan,
  billing_period,
  display_name,
  description,
  features,
  is_active
) VALUES (
  'dbe9f58f-fca2-4926-b1b9-1572f268ff04'::UUID,
  'dbe9f58f-fca2-4926-b1b9-1572f268ff04'::UUID,
  'professional',
  'month',
  'Professional Monthly',
  'Advanced tools for serious competitive edges - billed monthly',
  '{
    "analyses_per_month": null,
    "unlimited_scans": true,
    "api_access": true,
    "deep_sentiment": true,
    "market_alerts": true,
    "export_reports": true,
    "strategic_mapping": true,
    "foresight_engine": true,
    "custom_dashboards": true,
    "priority_support": true,
    "account_manager": true,
    "support": "24/7"
  }'::JSONB,
  true
);

-- Professional Yearly
INSERT INTO public.polar_product_mappings (
  polar_product_id,
  polar_price_id,
  plan,
  billing_period,
  display_name,
  description,
  features,
  is_active
) VALUES (
  'bddc5277-1bec-4f9d-8024-0c3b2837a2ac'::UUID,
  'bddc5277-1bec-4f9d-8024-0c3b2837a2ac'::UUID,
  'professional',
  'year',
  'Professional Yearly',
  'Advanced tools for serious competitive edges - billed annually',
  '{
    "analyses_per_month": null,
    "unlimited_scans": true,
    "api_access": true,
    "deep_sentiment": true,
    "market_alerts": true,
    "export_reports": true,
    "strategic_mapping": true,
    "foresight_engine": true,
    "custom_dashboards": true,
    "priority_support": true,
    "account_manager": true,
    "support": "24/7",
    "discount": "1 month free"
  }'::JSONB,
  true
);

-- ============================================
-- VERIFICATION
-- ============================================

DO $$
DECLARE
  mapping_count INT;
BEGIN
  SELECT COUNT(*) INTO mapping_count FROM public.polar_product_mappings WHERE is_active = true;

  RAISE NOTICE '✅ Product mappings seeded successfully';
  RAISE NOTICE '   Total active mappings: %', mapping_count;
  RAISE NOTICE '';
  RAISE NOTICE '   Plans configured:';
  RAISE NOTICE '     - Starter Monthly (50 analyses/month)';
  RAISE NOTICE '     - Starter Yearly (50 analyses/month, 2 months free)';
  RAISE NOTICE '     - Professional Monthly (unlimited)';
  RAISE NOTICE '     - Professional Yearly (unlimited, 1 month free)';
  RAISE NOTICE '';
  RAISE NOTICE '   Webhooks can now resolve plans automatically!';
END $$;
