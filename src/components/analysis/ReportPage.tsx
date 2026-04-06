'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '../../context/AuthContext'
import { AnalysisReport, SubscriptionPlan } from '../../types'
import { supabase } from '../../lib/supabase'
import { NavbarDemo } from '../Navbar'
import { LoaderTwo } from '../ui/loader'
import ReportView from './ReportView'
import { NoiseBackground } from '../ui/noise-background'
import {
  Sparkles,
  FileText,
  Link as LinkIcon,
  Lock,
  FileJson,
  FileSpreadsheet,
  FileDown,
  ExternalLink,
  Globe,
  CheckCircle,
  Layers,
  LayoutGrid,
  Download,
  Clock
} from 'lucide-react'
import { useSubscription } from '../../hooks/useSubscription'
import { cn } from '../../lib/utils'
import { getPlanConfig } from '../../lib/planFeatures'
import Link from 'next/link'
import { BackgroundBeams } from '../ui/aceternity/background-beams'
import { EncryptedText } from '../ui/aceternity/encrypted-text'
import { motion } from 'framer-motion'
type ReportTab = 'report' | 'resources'

const DOWNLOAD_FORMATS = [
  {
    id: 'json',
    label: 'JSON',
    icon: FileJson,
    description: 'Raw structured data',
    minPlan: 'hobby' as SubscriptionPlan,
    color: 'text-amber-500'
  },
  {
    id: 'csv',
    label: 'CSV',
    icon: FileSpreadsheet,
    description: 'Spreadsheet format',
    minPlan: 'starter' as SubscriptionPlan,
    color: 'text-emerald-500'
  },
  {
    id: 'pdf',
    label: 'PDF',
    icon: FileDown,
    description: 'Professional report',
    minPlan: 'hobby' as SubscriptionPlan,
    color: 'text-blue-500'
  }
]

const PLAN_RANK: Record<SubscriptionPlan, number> = {
  hobby: 0,
  starter: 1,
  professional: 2,
  enterprise: 3
}

function canAccess(userPlan: SubscriptionPlan, minPlan: SubscriptionPlan): boolean {
  return PLAN_RANK[userPlan] >= PLAN_RANK[minPlan]
}

export const ReportPage: React.FC = () => {
  const { id } = useParams()
  const { session, profile, loading: authLoading } = useAuth()
  const { effectivePlan, loading: subLoading } = useSubscription()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState<AnalysisReport | null>(null)
  const [query, setQuery] = useState<string>('')
  const [activeTab, setActiveTab] = useState<ReportTab>('report')
  const [downloading, setDownloading] = useState<string | null>(null)
  const currentPlan = effectivePlan
  const planConfig = getPlanConfig(effectivePlan)
  const maxCredits = planConfig.credits
  const remainingCredits = profile
    ? maxCredits === Infinity
      ? 'Unlimited'
      : Math.max(0, maxCredits - (profile.credits_used || 0))
    : 0

  const maxSources = planConfig.maxSources
  const visibleSources = report?.sources?.slice(0, maxSources) || []
  const hiddenCount = (report?.sources?.length || 0) - visibleSources.length

  useEffect(() => {
    const fetchReport = async () => {
      if (!id) {
        setLoading(false)
        return
      }

      setLoading(true)
      const { data, error } = await supabase
        .from('analysis_history')
        .select('report, query')
        .eq('id', id)
        .single()

      if (data?.report) {
        setReport(data.report)
        setQuery(data.query || '')
      }
      setLoading(false)
    }

    fetchReport()
  }, [id])

  useEffect(() => {
    if (!authLoading && !subLoading && !session) {
      router.replace('/login')
    }
  }, [session, authLoading, subLoading, router])

  useEffect(() => {
    if (!loading && !report && session) {
      router.replace('/analysis')
    }
  }, [loading, report, session, router])

  // Helper to trigger a file download from a Blob
  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 200)
  }

  const handleDownload = useCallback(
    async (formatId: string) => {
      if (!report) return

      try {
        setDownloading(formatId)
        
        if (formatId === 'json') {
          const blob = new Blob([JSON.stringify(report, null, 2)], {
            type: 'application/json'
          })
          triggerDownload(blob, `report-${id}.json`)
        }

        if (formatId === 'csv') {
          const headers = [
            'Weakness',
            'Frequency',
            'Pain Intensity',
            'Opportunity Score',
            'Significance'
          ]
          const rows =
            report.weaknessMatrix?.map(w => [
              `"${w.name}"`,
              w.frequency,
              w.painIntensity,
              w.opportunityScore,
              `"${w.significance}"`
            ]) || []
          const csv = [headers.join(','), ...rows.map(r => r.join(','))].join(
            '\n'
          )
          const blob = new Blob([csv], { type: 'text/csv' })
          triggerDownload(blob, `report-${id}.csv`)
        }

        if (formatId === 'pdf') {
          const { pdf } = await import('@react-pdf/renderer')
          const { default: AnalysisPDFCore } = await import('./AnalysisPDFCore')

          const blob = await pdf(<AnalysisPDFCore report={report} query={query} />).toBlob()
          triggerDownload(blob, `report-${id}.pdf`)
        }
      } catch (err) {
        import('@sentry/nextjs').then(Sentry => Sentry.captureException(err))
        console.error('Download failed', err)
      } finally {
        setDownloading(null)
      }
    },
    [report, id, query]
  )

  if (authLoading || subLoading) return null
  if (!session) return null

  if (loading) {
    return (
      <div className='min-h-screen bg-white dark:bg-black flex items-center justify-center'>
        <LoaderTwo size='lg' text='Fetching intelligence report...' />
      </div>
    )
  }

  if (!report) return null

  return (
    <div className='min-h-screen bg-white dark:bg-black'>
      <NavbarDemo
        session={session}
        profile={profile}
        credits={remainingCredits}
        hideDashboard={true}
      />

      {/* Fixed Bottom Right - New Analysis */}
      <div className='fixed bottom-8 right-8 z-50'>
        <div className='flex justify-center'>
          <NoiseBackground containerClassName='w-fit p-2 rounded-full mx-auto'>
            <button
              onClick={() => router.push('/analysis?new=true')}
              className='h-full w-full cursor-pointer rounded-full bg-neutral-100 px-8 py-3 text-black shadow-[0px_2px_0px_0px_var(--color-neutral-50)_inset,0px_0.5px_1px_0px_var(--color-neutral-400)] transition-all duration-100 active:scale-98 dark:bg-neutral-900 dark:text-white dark:shadow-[0px_1px_0px_0px_var(--color-neutral-950)_inset,0px_1px_0px_0px_var(--color-neutral-800)] flex items-center gap-2 font-medium border border-neutral-200 dark:border-neutral-800'
            >
              <Sparkles className='w-4 h-4 text-blue-500' />
              <span>Start New Research</span>
            </button>
          </NoiseBackground>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 py-8 pt-24'>
        {/* Header with Tab Switches + Download — same style as RecentAnalyses */}
      {/* Intelligence Hero Section */}
      <div className='relative pt-24 pb-12 overflow-hidden bg-neutral-50/50 dark:bg-[#0a0a0a]/50'>
        <BackgroundBeams className='opacity-40' />
        
        <div className='max-w-7xl mx-auto px-4 relative z-20'>
          <div className='flex flex-col items-center text-center space-y-8'>
            {/* Meta Info Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className='inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm'
            >
              <div className='flex items-center gap-1.5'>
                <div className='w-2 h-2 rounded-full bg-blue-500 animate-pulse' />
                <span className='text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.2em]'>
                  Autonomous Analysis
                </span>
              </div>
              <div className='w-px h-3 bg-neutral-200 dark:bg-neutral-800' />
              <span className='text-[10px] font-mono text-blue-500 font-bold'>
                ID-{id?.toString().slice(0, 8).toUpperCase()}
              </span>
            </motion.div>

            {/* Main Intelligence Title */}
            <div className='space-y-4 max-w-4xl'>
              {query && (
                <h2 className='text-4xl md:text-6xl font-bold text-black dark:text-white tracking-tight leading-[1.1]'>
                  <EncryptedText text={query} className='bg-clip-text text-transparent bg-gradient-to-b from-black to-neutral-600 dark:from-white dark:to-neutral-500' />
                </h2>
              )}
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className='text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto'
              >
                {activeTab === 'report'
                  ? 'Deep-layer market synthesis and strategic gap identification derived from autonomous intelligence feeds.'
                  : 'Primary grounding evidence and source documentation used to architect this analysis.'}
              </motion.p>
            </div>

            {/* Action Bar: Tabs & Export */}
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.2 }}
               className='flex flex-wrap justify-center items-center gap-4 w-full pt-4'
            >
              {/* Primary Tab Toggle */}
              <div className='inline-flex bg-neutral-100/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-2xl p-1.5 border border-neutral-200 dark:border-neutral-800 shadow-xl'>
                <button
                  onClick={() => setActiveTab('report')}
                  className={cn(
                    'flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300',
                    activeTab === 'report'
                      ? 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-lg border border-neutral-200/50 dark:border-neutral-700/50 scale-[1.02]'
                      : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300 translate-x-1'
                  )}
                >
                  <FileText className='w-4 h-4 text-blue-500' />
                  Intelligence Report
                </button>
                <button
                  onClick={() => setActiveTab('resources')}
                  className={cn(
                    'flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300',
                    activeTab === 'resources'
                      ? 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-lg border border-neutral-200/50 dark:border-neutral-700/50 scale-[1.02]'
                      : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300 -translate-x-1'
                  )}
                >
                  <LinkIcon className='w-4 h-4 text-emerald-500' />
                  Resources
                  {report.sources && report.sources.length > 0 && (
                    <span className='ml-1.5 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 text-[10px] font-black px-2 py-0.5 rounded-md'>
                      {report.sources.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Enhanced Export Menu */}
              <div className='inline-flex items-center bg-white dark:bg-neutral-900 rounded-2xl p-1.5 border border-neutral-200 dark:border-neutral-800 shadow-xl gap-1'>
                {DOWNLOAD_FORMATS.map(format => {
                  const Icon = format.icon
                  const hasAccess = canAccess(currentPlan, format.minPlan)

                  return (
                    <button
                      key={format.id}
                      disabled={downloading === format.id}
                      onClick={() =>
                        hasAccess
                          ? handleDownload(format.id)
                          : router.push('/pricing')
                      }
                      className={cn(
                        'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300',
                        hasAccess && downloading !== format.id
                          ? 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-black dark:hover:text-white'
                          : 'text-neutral-400 dark:text-neutral-600 cursor-not-allowed grayscale'
                      )}
                    >
                      {hasAccess ? (
                        downloading === format.id ? (
                          <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                        ) : (
                          <Icon className={cn('w-4 h-4', format.color)} />
                        )
                      ) : (
                        <Lock className='w-3.5 h-3.5' />
                      )}
                      {format.label}
                    </button>
                  )
                })}
              </div>
            </motion.div>

            {/* Quick Status Stats */}
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.8 }}
               className='flex items-center gap-8 pt-6 border-t border-neutral-200/50 dark:border-neutral-800/50 w-full max-w-2xl justify-center'
            >
               <div className='flex flex-col items-center gap-1'>
                 <span className='text-[10px] font-black text-neutral-400 dark:text-neutral-600 uppercase tracking-[0.2em]'>Reliability</span>
                 <div className='flex items-center gap-1.5'>
                    <div className='flex gap-0.5'>
                      {[1,2,3,4,5].map(i => <div key={i} className='w-1.5 h-1.5 rounded-full bg-blue-500' />)}
                    </div>
                    <span className='text-xs font-bold text-neutral-700 dark:text-neutral-300'>High</span>
                 </div>
               </div>
               <div className='w-px h-8 bg-neutral-200 dark:bg-neutral-800' />
               <div className='flex flex-col items-center gap-1'>
                 <span className='text-[10px] font-black text-neutral-400 dark:text-neutral-600 uppercase tracking-[0.2em]'>Vector Matches</span>
                 <span className='text-xs font-bold text-neutral-700 dark:text-neutral-300'>{report.sources?.length || 0} Grounding Nodes</span>
               </div>
               <div className='w-px h-8 bg-neutral-200 dark:bg-neutral-800' />
               <div className='flex flex-col items-center gap-1'>
                 <span className='text-[10px] font-black text-neutral-400 dark:text-neutral-600 uppercase tracking-[0.2em]'>Format</span>
                 <span className='text-xs font-bold text-neutral-700 dark:text-neutral-300 tracking-tighter'>Deep Intel V2.4</span>
               </div>
            </motion.div>
          </div>
        </div>
      </div>

        {/* Content Area */}
        <div className='mt-8'>
          {activeTab === 'report' ? (
            <ReportView report={report} userPlan={effectivePlan} />
          ) : (
            /* Resources Tab — same card styling as RecentAnalyses queue mode */
            <div className='relative bg-white dark:bg-black py-12 min-h-[400px]'>
              <div className='absolute inset-0 overflow-hidden'>
                <BackgroundBeams className='absolute inset-0' />
              </div>

              <div className='relative z-30 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12'>
                {/* Resources Header */}
                <div className='text-center space-y-4'>
                  <div className='inline-flex items-center space-x-3 bg-neutral-50 dark:bg-neutral-900 px-4 py-2 rounded-full border border-neutral-100 dark:border-neutral-800 shadow-sm'>
                    <Globe className='h-4 w-4 text-blue-500' />
                    <span className='text-sm font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-widest'>
                      Intelligence Sources
                    </span>
                  </div>
                  <h3 className='text-2xl font-bold text-black dark:text-white tracking-tight'>
                    Grounding Evidence
                  </h3>
                  <p className='text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto'>
                    The data sources and references that powered this competitive
                    intelligence report.
                  </p>
                </div>

                {/* Visible Sources */}
                {visibleSources.length > 0 ? (
                  <div className='grid gap-4 md:grid-cols-2'>
                    {visibleSources.map((source, i) => (
                      <a
                        key={i}
                        href={source.uri}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='group flex items-start gap-4 p-5 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 shadow-sm hover:shadow-xl'
                      >
                        <div className='flex-shrink-0 h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center border border-blue-100 dark:border-blue-800/30 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors'>
                          <LinkIcon className='w-4 h-4 text-blue-500' />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <h3 className='text-sm font-bold text-neutral-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'>
                            {source.title}
                          </h3>
                          <p className='text-[11px] text-neutral-400 truncate mt-1 font-mono'>
                            {source.uri}
                          </p>
                        </div>
                        <ExternalLink className='w-4 h-4 text-neutral-300 dark:text-neutral-600 group-hover:text-blue-500 transition-colors flex-shrink-0 mt-1' />
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className='text-center py-24 rounded-3xl border-2 border-dashed border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50'>
                    <Lock className='h-16 w-16 text-neutral-300 mx-auto mb-4' />
                    <h3 className='text-xl font-bold text-neutral-900 dark:text-white mb-2'>
                      Sources Hidden
                    </h3>
                    <p className='text-neutral-500 dark:text-neutral-400 mb-8'>
                      {currentPlan === 'hobby'
                        ? 'Upgrade to Starter to unlock source visibility.'
                        : 'No sources available for this report.'}
                    </p>
                    {currentPlan === 'hobby' && (
                      <Link
                        href='/pricing'
                        className='inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/25'
                      >
                        <Sparkles className='w-4 h-4' />
                        Upgrade Plan
                      </Link>
                    )}
                  </div>
                )}

                {/* Hidden Sources Upsell */}
                {hiddenCount > 0 && (
                  <div className='text-center'>
                    <div className='max-w-md mx-auto relative group cursor-pointer'>
                      <div className='absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-20 group-hover:opacity-30 transition-opacity' />
                      <Link
                        href='/pricing'
                        className='relative flex items-center justify-center gap-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-6 py-3 rounded-full text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:scale-105 transition-transform'
                      >
                        <Lock className='w-4 h-4 text-amber-500' />
                        <span>
                          Unlock {hiddenCount} more hidden source
                          {hiddenCount > 1 ? 's' : ''}
                        </span>
                      </Link>
                    </div>
                  </div>
                )}

                {/* Source Stats */}
                {visibleSources.length > 0 && (
                  <div className='flex justify-center gap-6'>
                    <div className='flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-full text-xs font-bold border border-emerald-100 dark:border-emerald-800/30'>
                      <CheckCircle className='w-3.5 h-3.5' />
                      {visibleSources.length} Verified Sources
                    </div>
                    {hiddenCount > 0 && (
                      <div className='flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-4 py-2 rounded-full text-xs font-bold border border-amber-100 dark:border-amber-800/30'>
                        <Lock className='w-3.5 h-3.5' />
                        {hiddenCount} Locked
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
