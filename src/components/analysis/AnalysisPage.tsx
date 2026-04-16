'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { AnalysisStep, AnalysisReport } from '@/types'
import * as Sentry from '@sentry/nextjs'
import LoadingState from '@/components/analysis/LoadingState'
import { LoadingIntelligence } from '@/components/analysis/LoadingIntelligence'
import { LoaderTwo } from '@/components/ui/loader'
import { supabase } from '@/lib/supabase'
import { NavbarDemo } from '@/components/Navbar'
import { useSubscription } from '@/hooks/useSubscription'
import { Card, CardContent } from '@/components/ui/card'
import { Button as ShadButton } from '@/components/ui/button'
import { ExampleBentoGrid } from '@/components/dashboard/ExampleBentoGrid'
import { BackgroundBeams } from '@/components/ui/aceternity/background-beams'
import { AnalyzePanel } from '@/components/dashboard/AnalyzePanel'
import { RecentAnalyses } from '@/components/dashboard/RecentAnalyses'
import { getPlanConfig } from '@/lib/planFeatures'
import { AlertCircle, Search, RefreshCw, X, ArrowDown } from 'lucide-react'

export const AnalysisPage: React.FC = () => {
  const { session, profile, loading: authLoading, fetchProfile } = useAuth()
  const { subscription, effectivePlan, loading: subLoading } = useSubscription()

  const searchParams = useSearchParams()
  const router = useRouter()
  const analyzeSectionRef = useRef<HTMLDivElement>(null)
  const streamEndRef = useRef<HTMLDivElement>(null)

  const [step, setStep] = useState<AnalysisStep>(AnalysisStep.IDLE)
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [report, setReport] = useState<AnalysisReport | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [streamedText, setStreamedText] = useState('')
  const [showStreamBanner, setShowStreamBanner] = useState(true)
  const [isAutoScrolling, setIsAutoScrolling] = useState(false)

  // Auto-scroll effect
  useEffect(() => {
    if (isAutoScrolling && streamEndRef.current) {
      streamEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [streamedText, isAutoScrolling])

  // Cancel auto-scroll on manual scroll interference
  useEffect(() => {
    const handleScroll = () => {
      if (isAutoScrolling) {
        setIsAutoScrolling(false)
      }
    }
    // Listen for manual ways the user scrolls to disable auto-scrolling
    window.addEventListener('wheel', handleScroll, { passive: true })
    window.addEventListener('touchmove', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('wheel', handleScroll)
      window.removeEventListener('touchmove', handleScroll)
    }
  }, [isAutoScrolling])

  // Fix #5: Post-checkout success UX
  const [showCheckoutSuccess, setShowCheckoutSuccess] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)
  
  // ADD new state:
  const [processingMessage, setProcessingMessage] = useState(
    'Processing your payment...'
  )
  const processingPaymentRef = useRef(false)

  const needsEmailConfirm = searchParams.get('confirm_email') === 'true'
  const handleResendConfirmation = async () => {
    try {
      const email = session?.user?.email
      if (!email) return
      await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/analysis`
        }
      })
      alert('Confirmation email sent! Check your inbox.')
    } catch {
      alert('Failed to resend email. Please try again.')
    }
  }

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
    if (step !== AnalysisStep.IDLE && step !== AnalysisStep.ERROR && queryText === query) return

    setQuery(queryText)
    setStep(AnalysisStep.RESEARCHING)
    setStreamedText('')
    setShowStreamBanner(true)
    setIsAutoScrolling(false)
    setError(null)
    setReport(null)

    try {
      const accessToken = session?.access_token
      if (!accessToken) {
        throw new Error('Authentication required')
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ query: queryText }),
      })
      
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Analysis failed')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      
      if (!reader) throw new Error('No response stream')
      
      let buffer = ''
      let finalReportData: any = null
      let streamError: string | null = null
      
      const processSSELine = (line: string) => {
        if (!line.startsWith('data: ')) return
        
        let data: any
        try {
          data = JSON.parse(line.slice(6))
        } catch {
          // Skip malformed JSON only
          return
        }
        
        if (data.chunk) {
          setStreamedText(prev => prev + data.chunk)
        }
        
        if (data.error) {
          // Capture the actual API error message
          streamError = data.error
        }
        
        if (data.done && data.report) {
          finalReportData = data.report
          setReport(data.report)
        }
      }
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''
        
        for (const line of lines) {
          processSSELine(line)
        }
        
        // Stop reading if we got an error from the API
        if (streamError) break
      }
      
      // Process any remaining data left in the buffer
      if (buffer.trim()) {
        processSSELine(buffer.trim())
      }
      
      // If the API sent an error event, throw it with the real message
      if (streamError) {
        throw new Error(streamError)
      }

      if (session) {
        fetchProfile(session)
      }

      if (finalReportData) {
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
        
        setStep(AnalysisStep.COMPLETED)
        router.push(analysisId ? `/report/${analysisId}` : '/report')
      } else {
        throw new Error(
            streamedText 
            ? 'The analysis timed out or the connection dropped before completion. This is usually due to high server load.' 
            : 'Analysis completed but no report was generated by the provider. Please try again.'
        )
      }
      
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
      return 'API limit reached. Please wait a minute before retrying.'
    }
    // Only return generic if it's completely opaque
    if (msg.includes('fetch failed') || msg === '{}') {
      return 'Analysis failed. Please try again.'
    }
    return msg
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

      {needsEmailConfirm && (
        <div className='max-w-4xl mx-auto px-4 pt-20 pb-0'>
          <div className='bg-blue-50 dark:bg-blue-950/30 border 
                          border-blue-200 dark:border-blue-800 
                          rounded-xl p-3 flex items-center justify-between'>
            <p className='text-sm text-blue-700 dark:text-blue-300'>
              📧 Please confirm your email to keep full access.
            </p>
            <button
              onClick={handleResendConfirmation}
              className='text-xs font-medium text-blue-600 
                         underline hover:no-underline ml-4'
            >
              Resend email
            </button>
          </div>
        </div>
      )}

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
          <div ref={analyzeSectionRef} id="analysis-search-section" className='relative bg-white dark:bg-black min-h-screen flex flex-col items-center justify-center pt-32 pb-32'>
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
          <ExampleBentoGrid />
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
            <>
              {showStreamBanner && (
                <div className='max-w-4xl mx-auto mb-4 animate-in fade-in slide-in-from-top-2'>
                  <div className='bg-blue-50/80 hover:bg-blue-50 dark:bg-blue-950/30 dark:hover:bg-blue-950/50 backdrop-blur-sm border border-blue-200/50 dark:border-blue-800/50 rounded-2xl p-4 flex items-start sm:items-center justify-between shadow-sm transition-colors'>
                    <div className='flex items-start sm:items-center gap-4'>
                      <div className='w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0'>
                        <div className='w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse' />
                      </div>
                      <div>
                        <h4 className='text-blue-900 dark:text-blue-100 font-semibold text-sm mb-0.5'>
                          Generating Intelligence Report
                        </h4>
                        <p className='text-blue-700 dark:text-blue-300 text-sm leading-relaxed max-w-2xl'>
                          Please wait while our AI engines compile your comprehensive analysis. Your report will be ready momentarily.
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowStreamBanner(false)} 
                      className='text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200 p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors flex-shrink-0'
                      title="Dismiss"
                    >
                      <X className='w-4 h-4' />
                    </button>
                  </div>
                </div>
              )}
              
              <div className='max-w-4xl mx-auto mb-8 relative'>
                <div className='bg-neutral-50 dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm'>
                  <div className='flex items-center gap-2 mb-4'>
                    <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse' />
                    <span className='text-sm font-medium text-neutral-500'>Analyzing {query}...</span>
                  </div>
                  <p className='text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed font-mono whitespace-pre-wrap overflow-hidden'>
                    {streamedText}
                    <span className='inline-block w-2 h-4 bg-neutral-400 animate-pulse ml-1 align-middle' />
                  </p>
                  <div ref={streamEndRef} className="h-4" />
                </div>
              </div>

              {!isAutoScrolling && (
                <button
                  onClick={() => {
                    setIsAutoScrolling(true)
                    streamEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
                  }}
                  className='fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-md text-neutral-700 dark:text-neutral-200 p-3.5 rounded-full shadow-xl border border-neutral-200 dark:border-neutral-700 hover:scale-105 hover:bg-white dark:hover:bg-neutral-800 active:scale-95 transition-all z-50 flex items-center justify-center animate-bounce group'
                  title="Scroll to bottom"
                >
                  <ArrowDown className="w-5 h-5 text-neutral-500 group-hover:text-neutral-800 dark:group-hover:text-neutral-100 transition-colors" />
                </button>
              )}
            </>
          )}
          
          {(step === AnalysisStep.RESEARCHING && !streamedText ||
            step === AnalysisStep.CLUSTERING ||
            step === AnalysisStep.SCORING) && (
            <div className='max-w-4xl mx-auto'>
              <LoadingIntelligence step={step} query={query} />
            </div>
          )}

          {step === AnalysisStep.ERROR && (
            <div className='max-w-2xl mx-auto py-20 px-4'>
              <div className='relative group'>
                {/* Glow Effect */}
                <div className='absolute -inset-1 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200' />
                
                <div className='relative bg-white dark:bg-neutral-900 border border-red-100 dark:border-red-900/30 rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden'>
                  <div className='absolute top-0 right-0 p-8 opacity-5'>
                    <AlertCircle size={140} className='text-red-500' />
                  </div>

                  <div className='relative z-10 flex flex-col items-center text-center'>
                    <div className='w-20 h-20 bg-red-50 dark:bg-red-950/30 rounded-2xl flex items-center justify-center mb-8 ring-1 ring-red-100 dark:ring-red-900/50'>
                      <AlertCircle className='w-10 h-10 text-red-600 dark:text-red-400' />
                    </div>

                    <h3 className='text-3xl font-bold text-neutral-900 dark:text-white mb-4 tracking-tight'>
                      Analysis Interrupted
                    </h3>
                    
                    <p className='text-neutral-600 dark:text-neutral-400 mb-10 max-w-md leading-relaxed text-lg'>
                      {error || "We encountered an unexpected issue while analyzing your request. Our intelligence engine might be experiencing high load."}
                    </p>

                    <div className='flex flex-col sm:flex-row gap-4 w-full justify-center'>
                      {retryCountdown > 0 ? (
                        <ShadButton disabled className='h-14 px-8 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 border-none min-w-[200px]'>
                          <RefreshCw className='w-4 h-4 mr-2 animate-spin' />
                          Retry in {retryCountdown}s
                        </ShadButton>
                      ) : (
                        <ShadButton
                          onClick={() => handleAnalyze(query)}
                          className='h-14 px-8 rounded-2xl bg-red-600 hover:bg-red-700 text-white border-none shadow-lg shadow-red-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] min-w-[200px] text-base font-semibold'
                        >
                          <RefreshCw className='w-4 h-4 mr-2' />
                          Retry Analysis
                        </ShadButton>
                      )}
                      
                      <ShadButton
                        onClick={() => {
                          setStep(AnalysisStep.IDLE)
                          setError(null)
                          setQuery('')
                        }}
                        variant='outline'
                        className='h-14 px-8 rounded-2xl border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all min-w-[200px] text-base font-medium'
                      >
                        <Search className='w-4 h-4 mr-2' />
                        New Search
                      </ShadButton>
                    </div>

                    <p className='mt-8 text-sm text-neutral-400 dark:text-neutral-500'>
                      Need help? <a href='/contact' className='text-red-600 dark:text-red-400 hover:underline'>Contact Support</a>
                    </p>
                  </div>
                </div>
              </div>
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
