'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { AnalysisStep, AnalysisReport } from '@/types'
import * as Sentry from '@sentry/nextjs'
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

declare global {
  interface Window {
    puter: any;
  }
}

const SYSTEM_INSTRUCTION = `
You are an expert competitive intelligence analyst. Your goal is to identify systematic product weaknesses that represent genuine business opportunities by analyzing real user feedback.

Follow this Research Protocol strictly:
1. Use Google Search to find high-signal sources: Reddit, G2, Capterra, Trustpilot, App Store, ProductHunt, Hacker News.
2. Extract specific complaints, frequency indicators, intensity signals ("dealbreaker", "switching"), and workaround mentions.
3. Group similar complaints into weakness patterns.
4. Assess Frequency, Pain Intensity, Monetization Potential, and Competitive Moat.

IMPORTANT: You MUST return the analysis ONLY as valid JSON (no markdown, no explanation text) in this exact format:
{
  "executiveSummary": "string",
  "weaknessMatrix": [
    {
      "name": "string",
      "frequency": "High|Medium|Low",
      "frequencyPercentage": "string",
      "painIntensity": "Severe|Moderate|Mild",
      "opportunityScore": number (1-5),
      "quotes": ["string"],
      "significance": "string",
      "competitorsAffected": [{"name": "string", "failureMode": "string"}],
      "monetizationSignals": "string"
    }
  ],
  "comparisonTable": [
    {
      "weakness": "string",
      "frequency": "string",
      "pain": "string",
      "moat": "string",
      "opportunityScore": number,
      "whyBuildThis": "string"
    }
  ],
  "strategicRecommendations": {
    "strongestOpportunity": "string",
    "quickWinAlternative": "string",
    "redFlags": "string"
  },
  "validationNextSteps": ["string"],
  "sources": [{"title": "string (name of the source)", "uri": "string (full URL)"}]
}

Avoid generic ratings. Be specific (e.g., "can't bulk-edit tasks on mobile" vs "poor UX"). Focus on paying users.
CRITICAL: In the "sources" array, include ALL URLs you referenced or found during your research. Each source must have a descriptive "title" and a valid full "uri". Include at least 5-10 sources.
`;

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
  const [streamedText, setStreamedText] = useState('')

  // Fix #5: Post-checkout success UX
  const [showCheckoutSuccess, setShowCheckoutSuccess] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)
  
  // ADD new state:
  const [processingMessage, setProcessingMessage] = useState(
    'Processing your payment...'
  )
  const processingPaymentRef = useRef(false)

  // Keep ref in sync with state:
  useEffect(() => {
    processingPaymentRef.current = processingPayment
  }, [processingPayment])

  // Fix #7: Rate Limit Countdown
  const [retryCountdown, setRetryCountdown] = useState(0)

  useEffect(() => {
    if (retryCountdown > 0) {
      const timer = setTimeout(() => setRetryCountdown(prev => prev - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [retryCountdown])

  interface RecentAnalysis {
    id: string
    query: string
    created_at: string
    report: AnalysisReport
  }

  // Dashboard state
  const [analyses, setAnalyses] = useState<RecentAnalysis[]>([])
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
        // Ignore Supabase query cancellation errors on rapid remounts
        if (error.message?.includes('Lock broken') || error.name === 'AbortError' || error.message?.includes('AbortError')) {
          return;
        }
        Sentry.captureException(error)
      } else if (data) {
        setAnalyses(data)
      }
    } catch (err: unknown) {
        if (err instanceof Error && (err.name === 'AbortError' || err.message?.includes('AbortError') || err.message?.includes('Lock broken'))) {
          return;
        }
      Sentry.captureException(err)
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

  // Fix #5: Handle ?checkout=success query param
  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      setProcessingPayment(true)
      window.history.replaceState({}, '', '/analysis')
      
      // Do NOT auto-clear after 2 seconds
      // Instead, show progressive messages
      const messages = [
        { delay: 0, text: 'Processing your payment...' },
        { delay: 5000, text: 'Confirming with payment provider...' },
        { delay: 15000, text: 'Still waiting — this can take up to 30 seconds...' },
        { delay: 30000, text: 'Taking longer than usual. Try refreshing if your plan doesn\'t update.' },
      ]
      
      const timeouts: NodeJS.Timeout[] = []
      
      messages.forEach(({ delay, text }) => {
        const t = setTimeout(() => {
          if (processingPaymentRef.current) {
            setProcessingMessage(text)
          }
        }, delay)
        timeouts.push(t)
      })
      
      // Store cleanup function
      return () => timeouts.forEach(clearTimeout)
    }
  }, [searchParams])

  // Fix #5: When plan upgrades from hobby, transition to success immediately
  useEffect(() => {
    if (processingPayment && effectivePlan !== 'hobby') {
      setProcessingPayment(false)
      setShowCheckoutSuccess(true)
    }
  }, [effectivePlan, processingPayment])



  const handleAnalyze = async (queryText: string) => {
    if (!queryText.trim() || isOutOfCredits) return
    if (
      step !== AnalysisStep.IDLE && 
      step !== AnalysisStep.ERROR && 
      queryText === query
    ) return

    setQuery(queryText)
    setStep(AnalysisStep.RESEARCHING)
    setStreamedText('')
    setError(null)
    setReport(null)

    try {
      const accessToken = session?.access_token
      if (!accessToken) {
        throw new Error('Authentication required')
      }

      // ── Use Puter.js for generation ──
      if (typeof window.puter === 'undefined') {
        throw new Error('Analysis engine failed to load. Please refresh the page.')
      }

      const prompt = `System: ${SYSTEM_INSTRUCTION}\n\nUser: Please analyze the following query for competitive weaknesses and opportunities: "${queryText}"\n\nRemember: Respond with ONLY valid JSON.`
      
      const flashResponse = await window.puter.ai.chat(
        prompt,
        {
          model: 'gemini-3.1-pro-preview',
          stream: true
        }
      );

      let fullText = ''
      for await (const part of flashResponse) {
        if (part?.text) {
          fullText += part.text
          setStreamedText(prev => prev + part.text)
        }
      }

      // ── Parse and Save ──
      let rawText = fullText.trim()
      if (rawText.startsWith('```json')) rawText = rawText.substring(7)
      else if (rawText.startsWith('```')) rawText = rawText.substring(3)
      if (rawText.endsWith('```')) rawText = rawText.substring(0, rawText.length - 3)
      rawText = rawText.trim()

      let finalReportData;
      try {
        finalReportData = JSON.parse(rawText)
      } catch (e) {
        throw new Error('Failed to parse analysis results. Please retry.')
      }

      // Save to our backend
      const saveResponse = await fetch('/api/save-analysis', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ query: queryText, report: finalReportData }),
      })

      if (!saveResponse.ok) {
        const data = await saveResponse.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to save analysis')
      }

      const { id: analysisId } = await saveResponse.json()
      
      if (session) {
        fetchProfile(session)
      }

      setReport(finalReportData)
      setStep(AnalysisStep.COMPLETED)
      router.push(analysisId ? `/report/${analysisId}` : '/report')
      
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err))
      Sentry.captureException(error)
      const errorMsg = getErrorMessage(error)
      setError(errorMsg)
      if (errorMsg.includes('limit reached')) {
        setRetryCountdown(60)
      }
      setStep(AnalysisStep.ERROR)
    }
  }

  // Helper to format error messages
  const getErrorMessage = (err: Error) => {
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

      {/* Fix #5: Post-checkout banners */}
      {processingPayment && (
        <div className='max-w-4xl mx-auto px-4 pt-24 pb-4'>
          <div className='bg-blue-50 dark:bg-blue-950/30 border 
                          border-blue-200 dark:border-blue-800 
                          rounded-xl p-4'>
            <div className='flex items-center gap-3 mb-3'>
              <div className='animate-spin h-5 w-5 border-2 
                              border-blue-500 border-t-transparent 
                              rounded-full flex-shrink-0' />
              <p className='text-blue-700 dark:text-blue-300 
                            font-medium text-sm'>
                {processingMessage}
              </p>
            </div>
            {/* Show refresh button */}
            <button
              onClick={() => window.location.reload()}
              className='text-xs text-blue-600 dark:text-blue-400 
                         underline hover:no-underline'
            >
              Refresh page
            </button>
          </div>
        </div>
      )}

      {showCheckoutSuccess && (
        <div className='max-w-4xl mx-auto px-4 pt-24 pb-4'>
          <div className='bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <span className='text-green-500 text-xl'>✓</span>
              <p className='text-green-700 dark:text-green-300 font-medium text-sm'>
                Payment successful! Your plan has been upgraded.
              </p>
            </div>
            <button
              onClick={() => setShowCheckoutSuccess(false)}
              className='text-green-500 hover:text-green-700 dark:hover:text-green-300 text-lg leading-none'
            >
              ✕
            </button>
          </div>
        </div>
      )}

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
            {/* Dummy anchor for download-button when no report exists */}
            <div data-tour="download-button" className="absolute top-4 right-4 w-10 h-10 pointer-events-none opacity-0" />
          </div>
          <RecentAnalyses
            analyses={analyses}
            loading={loadingAnalyses}
            onViewReport={a => router.push(`/report/${a.id}`)}
          />
          {!loadingAnalyses && analyses.length === 0 && step === AnalysisStep.IDLE && (
            <div data-tour="results-area" className='max-w-2xl mx-auto px-4 py-12 text-center'>
              <div className='w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-6'>
                <span className='text-3xl'>🔍</span>
              </div>
              <h3 className='text-xl font-semibold text-neutral-900 dark:text-white mb-3'>
                Run your first analysis
              </h3>
              <p className='text-neutral-600 dark:text-neutral-400 mb-6 text-sm leading-relaxed'>
                Enter a competitor name, product, or market above to get AI-powered intelligence on their positioning, weaknesses, and opportunities.
              </p>
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-lg mx-auto'>
                {[
                  { label: 'Try:', example: 'Analyze Notion competitors' },
                  { label: 'Try:', example: 'Slack vs Teams market position' },
                  { label: 'Try:', example: 'Figma competitive weaknesses' },
                ].map((item) => (
                  <button
                    key={item.example}
                    onClick={() => handleAnalyze(item.example)}
                    className='p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 text-left hover:border-neutral-400 dark:hover:border-neutral-600 transition group'
                  >
                    <span className='text-xs text-neutral-400 block mb-1'>
                      {item.label}
                    </span>
                    <span className='text-xs text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white transition'>
                      {item.example}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className='max-w-7xl mx-auto px-4 py-8 pt-24'>
          {step === AnalysisStep.RESEARCHING && streamedText && (
            <div className='max-w-4xl mx-auto mb-8'>
              <div className='bg-neutral-50 dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6'>
                <div className='flex items-center gap-2 mb-4'>
                  <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse' />
                  <span className='text-sm text-neutral-500'>Analyzing {query}...</span>
                </div>
                <p className='text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed font-mono whitespace-pre-wrap'>
                  {streamedText}
                  <span className='inline-block w-2 h-4 bg-neutral-400 animate-pulse ml-1' />
                </p>
              </div>
            </div>
          )}
          
          {(step === AnalysisStep.RESEARCHING && !streamedText ||
            step === AnalysisStep.CLUSTERING ||
            step === AnalysisStep.SCORING) && (
            <div className='max-w-4xl mx-auto'>
              <LoadingIntelligence step={step} query={query} />
            </div>
          )}

          {step === AnalysisStep.ERROR && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className='max-w-xl mx-auto py-20 text-center'
            >
              <div className='relative group'>
                {/* Animated gradient glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-red-500/20 rounded-[2.5rem] blur-2xl opacity-50 group-hover:opacity-75 transition duration-1000 animate-pulse" />
                
                <Card className='relative border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-black/70 backdrop-blur-3xl overflow-hidden rounded-[2rem] shadow-2xl'>
                  <CardContent className='pt-16 pb-12 px-8'>
                    <div className='relative mb-10'>
                      <div className='w-24 h-24 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto border border-red-500/20 rotate-3'>
                        <svg
                          className='w-12 h-12 text-red-500 -rotate-3'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={1.5}
                            d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                          />
                        </svg>
                      </div>
                      {/* Decorative elements */}
                      <div className="absolute top-0 right-1/4 w-3 h-3 bg-red-400/20 rounded-full blur-sm animate-ping" />
                    </div>
                    
                    <h3 className='text-3xl font-bold mb-4 text-neutral-900 dark:text-white tracking-tight'>
                      Analysis Interrupted
                    </h3>
                    
                    <div className='space-y-2 mb-12'>
                      <p className='text-neutral-600 dark:text-neutral-400 text-base leading-relaxed max-w-sm mx-auto font-medium'>
                        {error}
                      </p>
                      <p className='text-neutral-400 dark:text-neutral-500 text-xs uppercase tracking-widest'>
                        Error ID: Nex-Err-{Math.floor(Math.random() * 10000)}
                      </p>
                    </div>

                    <div className='flex flex-col items-center gap-6'>
                      {retryCountdown > 0 ? (
                        <div className='px-8 py-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 text-sm font-semibold border border-neutral-200 dark:border-neutral-700 shadow-inner'>
                          Retry possible in <span className="text-red-500 tabular-nums">{retryCountdown}s</span>
                        </div>
                      ) : (
                        <ShadButton
                          onClick={() => handleAnalyze(query)}
                          className='group relative bg-red-600 hover:bg-red-700 text-white px-10 py-7 rounded-2xl text-lg font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-red-500/25 w-full sm:w-auto h-auto'
                        >
                          <span className="relative z-10 flex items-center gap-2">
                             Retry Analysis
                             <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                             </svg>
                          </span>
                        </ShadButton>
                      )}
                      
                      <button 
                        onClick={() => {
                          setStep(AnalysisStep.IDLE)
                          setQuery('')
                        }}
                        className='text-sm font-medium text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors duration-300 flex items-center gap-2 group'
                      >
                        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to dashboard
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
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
