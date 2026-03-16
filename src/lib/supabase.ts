/**
 * SINGLE SOURCE OF TRUTH — Supabase Client
 *
 * ⚠️ SECURITY NOTE (Fix #5): A previous file at /lib/supabase.ts contained
 * hardcoded credentials for a different Supabase project (obviroknoyeiajcjzccx).
 * Those credentials are in git history and the affected project's anon key
 * MUST be rotated in the Supabase dashboard.
 *
 * This file uses environment variables and is the ONLY Supabase client
 * that should be imported anywhere in the application.
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})
