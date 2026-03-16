'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { AnalysisStep, AnalysisReport } from '@/types'
import { analyzeWeakness } from '@/services/geminiService'
import LoadingState from '@/components/analysis/LoadingState'
import { LoadingIntelligence } from '@/components/analysis/LoadingIntelligence'
import { LoaderTwo } from '@/components/ui/loader'
import { supabase } from '@/lib/supabase'
import { NavbarDemo } from '@/components/Navbar'
import { useSubscription } from '@/hooks/useSubscription'
import { Card, CardContent } from '@/components/ui/card'
import { Button as ShadButton } from '@/components/ui/button'
import { DashboardHero } from '@/components/dashboard/DashboardHero'
import { ExampleBentoGrid } from '@/components/dashboard/ExampleBentoGrid'
import { BackgroundBeams } from '@/components/ui/aceternity/background-beams'
import { AnalyzePanel } from '@/components/dashboard/AnalyzePanel'
import { RecentAnalyses } from '@/components/dashboard/RecentAnalyses'
import { getPlanConfig } from '@/lib/planFeatures'

export const AnalysisPage: React.FC = () => {
  const { session, profile, loading: authLoading, fetchProfile } = useAuth()
  const { subscription, effectivePlan, loading: subLoading } = useSubscription()

  const searchParams = useSearchParams()
  const router = useRouter()
  const analyzeSectionRef = useRef<HTMLDivElement>(null)

  const [step, setStep] = useState<AnalysisStep>(AnalysisStep.IDLE)
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [report, setReport] = useState<AnalysisReport | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Dashboard state
  const [analyses, setAnalyses] = useState<any[]>([])
  const [loadingAnalyses, setLoadingAnalyses] = useState(true)

  const planConfig = getPlanConfig(effectivePlan)
  const maxCredits = planConfig.credits
  const remainingCredits = profile
    ? maxCredits === Infinity
      ? 'Unlimited'
      : Math.max(0, maxCredits - (profile.credits_used || 0))
    : 0
  const isOutOfCredits =
    maxCredits !== Infinity && (profile?.credits_used || 0) >= maxCredits

  const fetchRecentAnalyses = async () => {
    try {
      const { data, error } = await supabase
        .from('analysis_history')
        .select('id, query, created_at, report')
        .eq('user_id', profile?.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('❌ Error fetching recent analyses:', error)
      } else if (data) {
        setAnalyses(data)
      }
    } catch (err) {
      console.error('❌ Unexpected error in fetchRecentAnalyses:', err)
    } finally {
      setLoadingAnalyses(false)
    }
  }

  useEffect(() => {
    const q = searchParams.get('q')
    if (q && step === AnalysisStep.IDLE) {
      setQuery(q)
      handleAnalyze(q)
    }
  }, [searchParams])

  useEffect(() => {
    // Scroll to analysis section if ?new=true is present
    if (searchParams.get('new') === 'true') {
      let attempts = 0
      const maxAttempts = 20 // Try for 2 seconds
      
      const interval = setInterval(() => {
        attempts++
        const element = document.getElementById('analysis-search-section')
        
        if (element) {
          clearInterval(interval)
          // Add a small delay to ensure layout is stable
          setTimeout(() => {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'center' // Center usually feels better for focus
            })
          }, 100)
        } else if (attempts >= maxAttempts) {
          clearInterval(interval)
        }
      }, 100)
      
      return () => clearInterval(interval)
    }
  }, [searchParams])

  useEffect(() => {
    if (profile?.id) {
      fetchRecentAnalyses()
    }
  }, [profile?.id])



  const handleAnalyze = async (queryText: string) => {
    if (!queryText.trim() || isOutOfCredits) return
    if (step !== AnalysisStep.IDLE && queryText === query) return

    setQuery(queryText)
    setStep(AnalysisStep.RESEARCHING)
    setError(null)
    setReport(null)

    const clusteringTimeout = setTimeout(
      () => setStep(AnalysisStep.CLUSTERING),
      4000
    )
    const scoringTimeout = setTimeout(() => setStep(AnalysisStep.SCORING), 8000)

    try {
      // Fix #1/#8: Pass auth token; credits + save are handled server-side atomically
      const accessToken = session?.access_token
      if (!accessToken) {
        throw new Error('Authentication required')
      }

      const result = await analyzeWeakness(queryText, accessToken)

      // Refresh profile to pick up updated credits_used
      if (session) {
        fetchProfile(session)
      }

      // Fetch latest analysis to get the ID for redirect
      let analysisId: string | null = null
      if (session?.user?.id) {
        const { data } = await supabase
          .from('analysis_history')
          .select('id')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (data) {
          analysisId = data.id
        }
      }

      setReport(result)
      setStep(AnalysisStep.COMPLETED)
      router.push(analysisId ? `/report/${analysisId}` : '/report')
    } catch (err: unknown) {
      clearTimeout(clusteringTimeout)
      clearTimeout(scoringTimeout)
      const error = err instanceof Error ? err : new Error(String(err))
      console.error('Analysis failed:', error.message)
      setError(getErrorMessage(error))
      setStep(AnalysisStep.ERROR)
    }
  }

  // Helper to format error messages
  const getErrorMessage = (err: any) => {
    const msg = err.message || JSON.stringify(err)
    if (
      msg.includes('429') ||
      msg.includes('quota') ||
      msg.includes('RESOURCE_EXHAUSTED')
    ) {
      return 'Gemini API limit reached. Please wait a minute before retrying, or upgrade to a paid Gemini plan for higher limits.'
    }
    return 'Analysis failed. Please try again.'
  }

  useEffect(() => {
    if (!authLoading && !session) {
      // Use replace so the user can't click "back" to return to the protected page
      router.replace('/login')
    }
  }, [authLoading, session, router])

  if (authLoading || subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <LoaderTwo />
      </div>
    )
  }

  if (!session) return null

  return (
    <div className='min-h-screen bg-white dark:bg-black'>
      <NavbarDemo
        session={session}
        profile={profile}
        credits={remainingCredits}
      />

      {step === AnalysisStep.IDLE && !searchParams.get('q') ? (
        <>
          <DashboardHero />
          <ExampleBentoGrid />
          <div ref={analyzeSectionRef} id="analysis-search-section" className='relative bg-white dark:bg-black py-24'>
            <div className='absolute inset-0 overflow-hidden'>
              <BackgroundBeams className='absolute inset-0' />
            </div>
            <div className='relative z-30'>
              <AnalyzePanel
                onAnalyze={handleAnalyze}
                disabled={isOutOfCredits}
                remainingCredits={remainingCredits}
              />
            </div>
          </div>
          <RecentAnalyses
            analyses={analyses}
            loading={loadingAnalyses}
            onViewReport={a => router.push(`/report/${a.id}`)}
          />
        </>
      ) : (
        <div className='max-w-7xl mx-auto px-4 py-8 pt-24'>
          {(step === AnalysisStep.RESEARCHING ||
            step === AnalysisStep.CLUSTERING ||
            step === AnalysisStep.SCORING) && (
            <div className='max-w-4xl mx-auto'>
              <LoadingIntelligence step={step} query={query} />
            </div>
          )}

          {step === AnalysisStep.ERROR && (
            <div className='max-w-xl mx-auto py-20 text-center'>
              <Card className='border-red-200 bg-red-50/50'>
                <CardContent className='pt-6'>
                  <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                    <svg
                      className='w-8 h-8 text-red-600'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                      />
                    </svg>
                  </div>
                  <h3 className='text-xl font-bold mb-2 text-red-900'>
                    Analysis Interrupted
                  </h3>
                  <p className='text-red-700 mb-6'>{error}</p>
                  <ShadButton
                    onClick={() => handleAnalyze(query)}
                    variant='destructive'
                  >
                    Retry Analysis
                  </ShadButton>
                </CardContent>
              </Card>
            </div>
          )}

          {step === AnalysisStep.COMPLETED && (
            <div className='animate-in fade-in slide-in-from-bottom-4 duration-700'>
              <div className='mb-8 text-center'>
                <p className='text-muted-foreground'>
                  Analysis complete! Redirecting to report...
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
