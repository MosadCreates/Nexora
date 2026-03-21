'use client'

import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { AnimatedTooltip } from '@/components/ui/aceternity/animated-tooltip'
import { BackgroundBeams } from '@/components/ui/aceternity/background-beams'
import { Eye, EyeOff } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { Turnstile } from '@marsidev/react-turnstile'
import * as Sentry from '@sentry/nextjs'

const people = [
  {
    id: 1,
    name: 'John Doe',
    designation: 'Software Engineer',
    image:
      'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3387&q=80'
  },
  {
    id: 2,
    name: 'Robert Johnson',
    designation: 'Product Manager',
    image:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXZhdGFyfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60'
  },
  {
    id: 3,
    name: 'Jane Smith',
    designation: 'Data Scientist',
    image:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YXZhdGFyfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60'
  },
  {
    id: 4,
    name: 'Emily Davis',
    designation: 'UX Designer',
    image:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60'
  },
  {
    id: 5,
    name: 'Tyler Durden',
    designation: 'Soap Developer',
    image:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3540&q=80'
  },
  {
    id: 6,
    name: 'Dora',
    designation: 'The Explorer',
    image:
      'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3534&q=80'
  }
]

// Fix #3: Map raw auth errors to user-friendly messages
function getUserFriendlyError(error: Error): string {
  const msg = error.message?.toLowerCase() || ''
  if (msg.includes('invalid login credentials') || msg.includes('invalid password')) {
    return 'Incorrect email or password. Please try again.'
  }
  if (msg.includes('email not confirmed')) {
    return 'Please check your email and confirm your account before signing in.'
  }
  if (msg.includes('user already registered')) {
    return 'An account with this email already exists. Try signing in instead.'
  }
  if (msg.includes('password') && msg.includes('characters')) {
    return 'Password must be at least 6 characters long.'
  }
  if (msg.includes('rate limit') || msg.includes('too many requests')) {
    return 'Too many attempts. Please wait a moment and try again.'
  }
  if (msg.includes('network') || msg.includes('fetch')) {
    return 'Network error. Please check your connection and try again.'
  }
  if (msg.includes('timeout')) {
    return 'The request timed out. Please check your connection and try again.'
  }
  return 'Something went wrong. Please try again.'
}

const Auth: React.FC = () => {
  const pathname = usePathname()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState<{
    type: 'error' | 'success'
    text: string
  } | null>(null)

  // Fix #10 (Audit 2): Turnstile CAPTCHA state
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  // Determine if signup mode based on URL path
  const isSignUp = pathname === '/signup'

  // Fix #14B: Ref for login timeout cleanup
  const loginTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Reset form when switching between login/signup
    setEmail('')
    setPassword('')
    setFirstName('')
    setLastName('')
    setMessage(null)
    setTurnstileToken(null)
  }, [pathname])

  // Fix #14B: Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (loginTimeoutRef.current) {
        clearTimeout(loginTimeoutRef.current)
      }
    }
  }, [])

  const verifyTurnstile = async (): Promise<boolean> => {
    if (!turnstileSiteKey) return true // Allow if Turnstile not configured
    if (!turnstileToken) {
      setMessage({ type: 'error', text: 'Please complete the CAPTCHA verification' })
      return false
    }

    try {
      const response = await fetch('/api/auth/verify-captcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: turnstileToken }),
      })
      const result = await response.json()
      if (!result.success) {
        setMessage({ type: 'error', text: result.error || 'CAPTCHA verification failed' })
        return false
      }
      return true
    } catch {
      setMessage({ type: 'error', text: 'CAPTCHA verification failed. Please try again.' })
      return false
    }
  }

  const handleResendConfirmation = async () => {
    try {
      setResendLoading(true)
      setResendSuccess(false)
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/analysis`,
        },
      })
      
      if (error) {
        Sentry.captureException(error)
        setMessage({ 
          type: 'error', 
          text: 'Failed to resend email. Please try again.' 
        })
      } else {
        setResendSuccess(true)
        setMessage({ 
          type: 'success', 
          text: 'Confirmation email sent! Check your inbox.' 
        })
      }
    } catch (err) {
      Sentry.captureException(err)
    } finally {
      setResendLoading(false)
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      // Fix #10 (Audit 2): Verify Turnstile before auth
      const captchaValid = await verifyTurnstile()
      if (!captchaValid) {
        setLoading(false)
        return
      }

      if (isSignUp) {
        const signUpPromise = supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName
            },
            emailRedirectTo: `${window.location.origin}/analysis`,
          }
        })
        
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error('signup_timeout')),
            15000
          )
        )
        
        const { data, error } = await Promise.race([
          signUpPromise,
          timeoutPromise,
        ]) as Awaited<ReturnType<typeof supabase.auth.signUp>>
        
        if (error) {
          Sentry.captureException(error, {
            tags: { action: 'signup', email_domain: email.split('@')[1] }
          })
          throw error
        }

        if (data.session) {
          // If auto-sign-in is enabled (no email confirmation needed)
          router.push('/')
        } else {
          // Email confirmation required
          setMessage({
            type: 'success', 
            text: "Account created! Check your email for a confirmation link. If it doesn't arrive within 5 minutes, use the resend button below."
          })
          setNeedsEmailConfirmation(true)
        }
      } else {
        // Fix #14 (Audit 2): Removed console.log that exposed email
        const loginPromise = supabase.auth.signInWithPassword({
          email,
          password
        });
        
        const timeoutPromise = new Promise<never>((_, reject) => {
          loginTimeoutRef.current = setTimeout(() => reject(new Error('Login timed out. Please check your connection.')), 15000)
        });

        try {
          const { data, error } = await Promise.race([loginPromise, timeoutPromise]) as Awaited<typeof loginPromise>;
          
          if (error) {
            throw error;
          }
          
          // Fix #14 (Audit 2): Removed console.log of session details
          router.replace('/')
        } catch (err: unknown) {
          throw err;
        }
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error))
      setMessage({ type: 'error', text: getUserFriendlyError(err) })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      if (error) throw error
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error))
      setMessage({ type: 'error', text: getUserFriendlyError(err) })
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setMessage({
        type: 'error',
        text: 'Please enter your email address first'
      })
      return
    }
    setLoading(true)
    setMessage(null)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      if (error) throw error
      setMessage({
        type: 'success',
        text: 'Check your email for the password reset link!'
      })
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error))
      setMessage({ type: 'error', text: getUserFriendlyError(err) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='md:h-screen md:overflow-hidden bg-white dark:bg-black flex pt-20'>
      {/* Left Column - Login Form */}
      <div className='flex-1 flex items-center justify-center px-8 py-12 relative overflow-hidden md:h-full'>
        <BackgroundBeams className='absolute inset-0' />
        <div className='w-full max-w-md relative z-10'>
          {/* Logo */}
          <div className='flex items-center gap-2 mb-8'>
            <div className='h-7 w-7 bg-black dark:bg-white rounded'></div>
            <span className='text-lg font-normal text-black dark:text-white'>
              Nexora
            </span>
          </div>

          {/* Title */}
          <h1 className='text-2xl font-normal text-black dark:text-white mb-8'>
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </h1>

          {/* Error/Success Message */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg text-sm ${
                message.type === 'error'
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                  : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800'
              }`}
            >
              {message.text}
            </div>
          )}

          {needsEmailConfirmation && (
            <div className='mb-6 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl'>
              <p className='text-sm text-blue-700 dark:text-blue-300 mb-3'>
                Check your inbox at <strong>{email}</strong> for a confirmation email.
              </p>
              <button
                onClick={handleResendConfirmation}
                disabled={resendLoading || resendSuccess}
                className='text-sm font-medium text-blue-600 dark:text-blue-400 underline hover:no-underline disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {resendLoading ? 'Sending...' : resendSuccess ? 'Email sent! ✓' : 'Resend confirmation email'}
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAuth} className='space-y-5'>
            {isSignUp && (
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-xs font-normal text-gray-600 dark:text-gray-400 mb-2'>
                    First Name
                  </label>
                  <input
                    type='text'
                    required
                    className='w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-800 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent outline-none transition-all text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500'
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder='John'
                  />
                </div>
                <div>
                  <label className='block text-xs font-normal text-gray-600 dark:text-gray-400 mb-2'>
                    Last Name
                  </label>
                  <input
                    type='text'
                    required
                    className='w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-800 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent outline-none transition-all text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500'
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder='Doe'
                  />
                </div>
              </div>
            )}

            <div>
              <label className='block text-xs font-normal text-gray-600 dark:text-gray-400 mb-2'>
                Email address
              </label>
              <input
                type='email'
                required
                className='w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-800 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent outline-none transition-all text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500'
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder='hello@johndoe.com'
              />
            </div>

            <div>
              <label className='block text-xs font-normal text-gray-600 dark:text-gray-400 mb-2'>
                Password
              </label>
              <div className='relative'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  className='w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-800 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent outline-none transition-all text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500'
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder='********'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors'
                >
                  {showPassword ? (
                    <EyeOff className='w-5 h-5' />
                  ) : (
                    <Eye className='w-5 h-5' />
                  )}
                </button>
              </div>
            </div>

            {!isSignUp && (
              <div className='flex justify-end'>
                <button
                  type='button'
                  onClick={handleForgotPassword}
                  className='text-xs text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors'
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Fix #10 (Audit 2): Cloudflare Turnstile CAPTCHA */}
            {turnstileSiteKey && (
              <div className='flex justify-center'>
                <Turnstile
                  siteKey={turnstileSiteKey}
                  onSuccess={(token) => setTurnstileToken(token)}
                  onExpire={() => setTurnstileToken(null)}
                  onError={() => setTurnstileToken(null)}
                />
              </div>
            )}

            <button
              type='submit'
              disabled={loading || (!!turnstileSiteKey && !turnstileToken)}
              className='w-full py-3 bg-black dark:bg-white text-white dark:text-black font-normal rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-all text-sm'
            >
              {loading ? 'Processing...' : isSignUp ? 'Sign up' : 'Sign in'}
            </button>
          </form>

          {/* Sign Up / Sign In Toggle */}
          <div className='mt-6 text-center'>
            <span className='text-xs text-gray-600'>
              {isSignUp
                ? 'Already have an account? '
                : "Don't have an account? "}
            </span>
            <button
              onClick={() => router.push(isSignUp ? '/login' : '/signup')}
              className='text-xs font-normal text-black dark:text-white hover:underline'
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </div>

          {/* Divider */}
          <div className='relative my-8'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-gray-300'></div>
            </div>
            <div className='relative flex justify-center text-xs'>
              <span className='px-4 bg-white dark:bg-neutral-900 text-gray-500 dark:text-gray-400'>
                Or continue with
              </span>
            </div>
          </div>

          {/* google OAuth Button */}
          <button
  onClick={() => supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/analysis`
    }
  })}
  className="w-full flex items-center justify-center gap-3 
             px-4 py-3 rounded-xl border border-neutral-300 
             dark:border-neutral-700 bg-white dark:bg-neutral-900 
             text-neutral-700 dark:text-neutral-300 font-medium 
             text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 
             transition"
>
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
  Continue with Google
</button>

          {/* Terms and Privacy */}
          <p className='mt-8 text-xs text-gray-500 dark:text-gray-400 text-center'>
            By clicking on {isSignUp ? 'sign up' : 'sign in'}, you agree to our{' '}
            <a
              href='/terms'
              className='underline hover:text-gray-700 dark:hover:text-gray-300'
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href='/privacy'
              className='underline hover:text-gray-700 dark:hover:text-gray-300'
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>

      {/* Right Column - Promotional Content */}
      <div className='relative flex-1 hidden lg:flex border-l border-neutral-100 dark:border-neutral-900 overflow-hidden bg-gray-50 dark:bg-black items-center justify-center md:h-full'>
        <div className='max-w-sm mx-auto'>
          <div className='flex flex-row items-center justify-center mb-10 w-full'>
            <AnimatedTooltip items={people} isLogo={false} />
          </div>
          <p className='font-semibold text-xl text-center dark:text-neutral-400 text-neutral-600'>
            Trusted by analysts worldwide
          </p>
          <p className='font-normal text-base text-center text-neutral-500 dark:text-neutral-200 mt-8'>
            Nexora uses advanced AI to uncover competitor weaknesses and
            market opportunities — helping teams make smarter strategic decisions.
          </p>
        </div>

        {/* Dashed Line SVGs */}
        <svg
          width='1595'
          height='2'
          viewBox='0 0 1595 2'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
          className='absolute w-full object-contain pointer-events-none top-20'
        >
          <path
            d='M0 1H1594.5'
            stroke='url(#line-path-gradient-auth-top)'
            strokeDasharray='8 8'
          ></path>
          <defs>
            <linearGradient
              id='line-path-gradient-auth-top'
              x1='0'
              y1='1.5'
              x2='1594.5'
              y2='1.5'
              gradientUnits='userSpaceOnUse'
            >
              <stop stopColor='white' stopOpacity='0'></stop>
              <stop offset='0.2' stopColor='var(--neutral-400)'></stop>
              <stop offset='0.8' stopColor='var(--neutral-400)'></stop>
              <stop offset='1' stopColor='white' stopOpacity='0'></stop>
            </linearGradient>
          </defs>
        </svg>
        <svg
          width='1595'
          height='2'
          viewBox='0 0 1595 2'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
          className='absolute w-full object-contain pointer-events-none bottom-20'
        >
          <path
            d='M0 1H1594.5'
            stroke='url(#line-path-gradient-auth-bottom)'
            strokeDasharray='8 8'
          ></path>
          <defs>
            <linearGradient
              id='line-path-gradient-auth-bottom'
              x1='0'
              y1='1.5'
              x2='1594.5'
              y2='1.5'
              gradientUnits='userSpaceOnUse'
            >
              <stop stopColor='white' stopOpacity='0'></stop>
              <stop offset='0.2' stopColor='var(--neutral-400)'></stop>
              <stop offset='0.8' stopColor='var(--neutral-400)'></stop>
              <stop offset='1' stopColor='white' stopOpacity='0'></stop>
            </linearGradient>
          </defs>
        </svg>
        <svg
          width='1595'
          height='2'
          viewBox='0 0 1595 2'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
          className='absolute w-full object-contain pointer-events-none -right-80 transform rotate-90 inset-y-0 h-full scale-x-150'
        >
          <path
            d='M0 1H1594.5'
            stroke='url(#line-path-gradient-auth-right)'
            strokeDasharray='8 8'
          ></path>
          <defs>
            <linearGradient
              id='line-path-gradient-auth-right'
              x1='0'
              y1='1.5'
              x2='1594.5'
              y2='1.5'
              gradientUnits='userSpaceOnUse'
            >
              <stop stopColor='white' stopOpacity='0'></stop>
              <stop offset='0.2' stopColor='var(--neutral-400)'></stop>
              <stop offset='0.8' stopColor='var(--neutral-400)'></stop>
              <stop offset='1' stopColor='white' stopOpacity='0'></stop>
            </linearGradient>
          </defs>
        </svg>
        <svg
          width='1595'
          height='2'
          viewBox='0 0 1595 2'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
          className='absolute w-full object-contain pointer-events-none -left-80 transform rotate-90 inset-y-0 h-full scale-x-150'
        >
          <path
            d='M0 1H1594.5'
            stroke='url(#line-path-gradient-auth-left)'
            strokeDasharray='8 8'
          ></path>
          <defs>
            <linearGradient
              id='line-path-gradient-auth-left'
              x1='0'
              y1='1.5'
              x2='1594.5'
              y2='1.5'
              gradientUnits='userSpaceOnUse'
            >
              <stop stopColor='white' stopOpacity='0'></stop>
              <stop offset='0.2' stopColor='var(--neutral-400)'></stop>
              <stop offset='0.8' stopColor='var(--neutral-400)'></stop>
              <stop offset='1' stopColor='white' stopOpacity='0'></stop>
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  )
}

export default Auth
