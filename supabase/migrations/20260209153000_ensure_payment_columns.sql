-- Ensure payment columns exist and have correct types
DO $$
BEGIN
    -- Check for payment_subscription_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'payment_subscription_id') THEN
        ALTER TABLE public.profiles ADD COLUMN payment_subscription_id TEXT;
    END IF;

    -- Check for payment_customer_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'payment_customer_id') THEN
        ALTER TABLE public.profiles ADD COLUMN payment_customer_id TEXT;
    END IF;

    -- Check for subscription_plan
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'subscription_plan') THEN
        ALTER TABLE public.profiles ADD COLUMN subscription_plan TEXT DEFAULT 'hobby';
    END IF;

    -- Check for subscription_status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'subscription_status') THEN
        ALTER TABLE public.profiles ADD COLUMN subscription_status TEXT;
    END IF;

    -- Check for subscription_billing_period
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'subscription_billing_period') THEN
        ALTER TABLE public.profiles ADD COLUMN subscription_billing_period TEXT;
    END IF;

    -- Check for subscription_end_date
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'subscription_end_date') THEN
        ALTER TABLE public.profiles ADD COLUMN subscription_end_date TIMESTAMPTZ;
    END IF;

    -- Check for cancel_at_period_end
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'cancel_at_period_end') THEN
        ALTER TABLE public.profiles ADD COLUMN cancel_at_period_end BOOLEAN DEFAULT FALSE;
    END IF;
END $$;
