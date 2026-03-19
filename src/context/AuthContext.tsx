'use client'

import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { UserProfile } from '../types'

interface AuthContextType {
  session: any
  profile: UserProfile | null
  loading: boolean
  error: string | null
  fetchProfile: (session: any) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider ({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = async (currentSession: any) => {
    if (!currentSession?.user) return

    // Fix #14 (Audit 2): Removed console.log that exposed user ID
    const startTime = Date.now();
    
    // Create a promise with a timeout
    const fetchPromise = supabase
      .from('profiles')
      .select('*')
      .eq('id', currentSession.user.id)
      .single();

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
    );

    try {
      const { data, error } = (await Promise.race([fetchPromise, timeoutPromise])) as any;

      if (
        error &&
        (error.code === 'PGRST116' || error.message?.includes('0 rows'))
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
          .select()
          .single()

        if (createError) {
          setError(`Failed to create profile: ${createError.message}`)
        } else if (newProfile) {
          setProfile(newProfile)
        }
      } else if (data) {
        setProfile(data)
      } else if (error) {
        setError(`Failed to fetch profile: ${error.message}`)
      }
    } catch (err: any) {
      // Fix #14 (Audit 2): Removed console.warn that exposed user details
      // We don't block the app for profile fetch errors
    }
  }

  const initialized = useRef(false);

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      if (initialized.current) return;
      initialized.current = true;

      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(initialSession);
          if (initialSession) {
            await fetchProfile(initialSession);
            localStorage.setItem('supabase-session-hint', 'true');
          }
        }
      } catch (err: any) {
        // Silent fail, handled by loading state
      } finally {
        setLoading(false);
      }
    }

    initializeAuth();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      
      if (session) {
        localStorage.setItem('supabase-session-hint', 'true');
        fetchProfile(session);
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
  }, [])

  return (
    <AuthContext.Provider
      value={{ session, profile, loading, error, fetchProfile }}
    >
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
