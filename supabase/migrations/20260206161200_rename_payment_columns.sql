-- Rename Stripe-specific columns to generic payment columns
-- This migration makes the schema payment-provider agnostic

-- Rename stripe_customer_id to payment_customer_id
ALTER TABLE profiles
RENAME COLUMN stripe_customer_id TO payment_customer_id;

-- Rename stripe_subscription_id to payment_subscription_id
ALTER TABLE profiles
RENAME COLUMN stripe_subscription_id TO payment_subscription_id;

-- Create polar_webhook_logs table (similar to stripe_webhook_logs)
CREATE TABLE IF NOT EXISTS polar_webhook_logs (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE
);

-- Add index for faster webhook lookup
CREATE INDEX IF NOT EXISTS idx_polar_webhook_logs_event_id ON polar_webhook_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_polar_webhook_logs_processed ON polar_webhook_logs(processed);

-- Add comment to clarify the column purpose
COMMENT ON COLUMN profiles.payment_customer_id IS 'Payment provider customer ID (Polar, Stripe, etc.)';
COMMENT ON COLUMN profiles.payment_subscription_id IS 'Payment provider subscription ID';
