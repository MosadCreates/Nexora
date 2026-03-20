'use client'

import React, { createContext, useContext, useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { UserProfile } from '../types'
import * as Sentry from '@sentry/nextjs'

interface AuthContextType {
  session: { user: { id: string; email?: string; user_metadata?: Record<string, string> }; access_token: string } | null
  profile: UserProfile | null
  loading: boolean
  error: string | null
  fetchProfile: (session: { user: { id: string; email?: string; user_metadata?: Record<string, string> } }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider ({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthContextType['session']>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async (currentSession: { user: { id: string; email?: string; user_metadata?: Record<string, string> } }) => {
    if (!currentSession?.user) return

    const startTime = Date.now();
    
    // Create a promise with a timeout
    const fetchPromise = supabase
      .from('profiles')
      .select('id, first_name, last_name, email, credits_used')
      .eq('id', currentSession.user.id)
      .single();

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
    );

    try {
      const result = await Promise.race([fetchPromise, timeoutPromise]) as Awaited<typeof fetchPromise>;
      const { data, error: fetchError } = result;

      if (
        fetchError &&
        (fetchError.code === 'PGRST116' || fetchError.message?.includes('0 rows'))
      ) {
        // Create profile if missing
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: currentSession.user.id,
            email: currentSession.user.email,
            first_name: currentSession.user.user_metadata?.first_name || '',
            last_name: currentSession.user.user_metadata?.last_name || ''
          })
          .select('id, first_name, last_name, email, credits_used')
          .single()

        if (createError) {
          setError(`Failed to create profile: ${createError.message}`)
          Sentry.captureException(createError)
        } else if (newProfile) {
          setProfile(newProfile as UserProfile)
        }
      } else if (data) {
        setProfile(data as UserProfile)
      } else if (fetchError) {
        setError(`Failed to fetch profile: ${fetchError.message}`)
        Sentry.captureException(fetchError)
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err)
      setError('Unable to load your profile. Please refresh the page.')
      Sentry.captureException(err)
    }
  }, [])

  const initialized = useRef(false);

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      if (initialized.current) return;
      initialized.current = true;

      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(initialSession as AuthContextType['session']);
          if (initialSession) {
            await fetchProfile(initialSession as { user: { id: string; email?: string; user_metadata?: Record<string, string> } });
            localStorage.setItem('supabase-session-hint', 'true');
          }
        }
      } catch (err: unknown) {
        if (mounted) {
          setError('Authentication initialization failed.')
          Sentry.captureException(err)
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initializeAuth();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession as AuthContextType['session']);
      
      if (newSession) {
        localStorage.setItem('supabase-session-hint', 'true');
        fetchProfile(newSession as { user: { id: string; email?: string; user_metadata?: Record<string, string> } });
      } else {
        setProfile(null);
        localStorage.removeItem('supabase-session-hint');
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    }
  }, [fetchProfile])

  const value = useMemo(() => ({
    session,
    profile,
    loading,
    error,
    fetchProfile
  }), [session, profile, loading, error, fetchProfile])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth () {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
