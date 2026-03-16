-- Add cancel_at_period_end column to profiles table
-- This allows us to track if a subscription is set to cancel at the end of the current period

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT FALSE;

-- Add comment to document the column
COMMENT ON COLUMN public.profiles.cancel_at_period_end IS 'Whether the subscription will cancel at the end of the current billing period';

-- Create an index for faster queries if needed
CREATE INDEX IF NOT EXISTS idx_profiles_cancel_at_period_end
ON public.profiles(cancel_at_period_end);
