-- ============================================
-- Create polar_product_mappings table
-- This allows flexible plan identification without hardcoding product IDs
-- ============================================

CREATE TABLE IF NOT EXISTS public.polar_product_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Polar identifiers
  polar_product_id UUID NOT NULL,
  polar_price_id UUID NOT NULL,

  -- Internal plan mapping
  plan TEXT NOT NULL,
  billing_period TEXT NOT NULL,

  -- Display metadata
  display_name TEXT NOT NULL,
  description TEXT,

  -- Feature flags (JSON for flexibility)
  features JSONB DEFAULT '{}'::jsonb,

  -- Status
  is_active BOOLEAN DEFAULT TRUE NOT NULL,

  -- Constraints
  CONSTRAINT valid_mapping_billing_period
    CHECK (billing_period IN ('month', 'year')),
  CONSTRAINT unique_price_mapping
    UNIQUE (polar_price_id)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_polar_product_mappings_product_id
  ON public.polar_product_mappings(polar_product_id)
  WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_polar_product_mappings_price_id
  ON public.polar_product_mappings(polar_price_id)
  WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_polar_product_mappings_plan
  ON public.polar_product_mappings(plan, billing_period)
  WHERE is_active = TRUE;

-- Enable RLS (only admins can modify)
ALTER TABLE public.polar_product_mappings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read active mappings (for pricing page)
CREATE POLICY "Anyone can read active product mappings"
ON public.polar_product_mappings
FOR SELECT
USING (is_active = true);

-- Comments
COMMENT ON TABLE public.polar_product_mappings IS
  'Maps Polar product/price IDs to internal plan tiers. Allows flexible plan changes without code deploys.';

COMMENT ON COLUMN public.polar_product_mappings.polar_product_id IS
  'Polar product UUID from their API.';

COMMENT ON COLUMN public.polar_product_mappings.polar_price_id IS
  'Polar price UUID. Each product can have multiple prices (monthly/yearly).';

COMMENT ON COLUMN public.polar_product_mappings.plan IS
  'Internal plan identifier: hobby, starter, professional, enterprise, custom';

COMMENT ON COLUMN public.polar_product_mappings.features IS
  'JSON object defining plan features. Example: {"analyses_per_month": 50, "api_access": true}';

COMMENT ON COLUMN public.polar_product_mappings.is_active IS
  'Whether this mapping is currently active. Set to FALSE to deprecate a plan without deleting history.';
