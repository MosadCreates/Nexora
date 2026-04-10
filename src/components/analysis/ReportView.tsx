import React from 'react'
import { AnalysisReport, SubscriptionPlan } from '../../types'
import {
  CheckCircle,
  TriangleAlert,
  Lightbulb,
  Link as LinkIcon,
  BarChart,
  Lock
} from 'lucide-react'

interface ReportViewProps {
  report: AnalysisReport
  userPlan: SubscriptionPlan
}

const ReportView: React.FC<ReportViewProps> = ({ report, userPlan }) => {
  if (!report) {
    return (
      <div className='flex items-center justify-center py-20 text-neutral-500 italic'>
        Report data is not available.
      </div>
    )
  }

  return (
    <div className='max-w-6xl mx-auto pb-24 px-4 sm:px-6 lg:px-8 space-y-10 md:space-y-16 animate-in fade-in duration-1000'>
      {/* Executive Summary */}
      <section className='bg-white dark:bg-neutral-900 rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-2xl border border-neutral-100 dark:border-neutral-800 relative overflow-hidden'>
        <div className='absolute top-0 right-0 p-8 opacity-5'>
          <BarChart className='w-32 h-32' />
        </div>
        <h2 className='text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-2'>
          <CheckCircle className='w-4 h-4' />
          Executive Intelligence Summary
        </h2>
        <p className='text-lg md:text-2xl text-neutral-800 dark:text-neutral-100 leading-relaxed font-semibold max-w-4xl'>
          {report.executiveSummary || 'Generating summary...'}
        </p>
      </section>

      {/* Weakness Matrix */}
      <section>
        <div className='flex items-center gap-4 mb-10'>
          <div className='h-10 w-1 bg-blue-500 rounded-full' />
          <h2 className='text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white'>
            Competitive Weakness Matrix
          </h2>
        </div>
        <div className='grid gap-8 lg:grid-cols-2'>
          {report.weaknessMatrix?.map((w, idx) => (
            <div
              key={idx}
              className='bg-white dark:bg-neutral-900 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-xl border border-neutral-100 dark:border-neutral-800 transition-all hover:border-blue-500 dark:hover:border-blue-400 group'
            >
              <div className='flex flex-wrap items-start justify-between gap-4 mb-8'>
                <div className='flex-1'>
                  <h3 className='text-xl md:text-2xl font-bold text-neutral-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'>
                    {w.name}
                  </h3>
                  <div className='flex flex-wrap gap-3'>
                    <span className='px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold'>
                      {w.frequency} ({w.frequencyPercentage})
                    </span>
                    <span className='px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs font-bold'>
                      Intensity: {w.painIntensity}
                    </span>
                  </div>
                </div>
                <div className='flex flex-col items-end'>
                  <span className='text-[10px] font-bold text-neutral-400 uppercase tracking-tighter mb-1'>
                    Impact Score
                  </span>
                  <div className='flex gap-1'>
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 w-6 rounded-full ${
                          i < w.opportunityScore
                            ? 'bg-blue-500'
                            : 'bg-neutral-200 dark:bg-neutral-800'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className='space-y-8'>
                <div>
                  <h4 className='text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-4 flex items-center gap-2'>
                    <Lightbulb className='w-3 h-3' />
                    Strategic Significance
                  </h4>
                  <p className='text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed font-medium bg-neutral-50 dark:bg-black/20 p-4 rounded-2xl'>
                    {w.significance}
                  </p>
                </div>

                <div className='grid sm:grid-cols-2 gap-6'>
                  <div>
                    <h4 className='text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-3'>
                      Direct Quotes
                    </h4>
                    <div className='space-y-4'>
                      {w.quotes?.slice(0, 2).map((quote, qIdx) => (
                        <div
                          key={qIdx}
                          className='relative italic text-xs text-neutral-500 dark:text-neutral-400 pl-4 border-l-2 border-blue-200 dark:border-neutral-800'
                        >
                          "{quote}"
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className='text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-3 text-green-600'>
                      Monetization
                    </h4>
                    <p className='text-xs text-neutral-500 dark:text-neutral-400 italic'>
                      {w.monetizationSignals}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Opportunity Ranking - Simplified Grid for Stability */}
      <section>
        <div className='flex items-center gap-4 mb-10'>
          <div className='h-10 w-1 bg-emerald-500 rounded-full' />
          <h2 className='text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white'>
            Market Opportunity Ranking
          </h2>
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'>
          {report.comparisonTable?.map((row, idx) => (
            <div
              key={idx}
              className='bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-xl relative overflow-hidden'
            >
              <div className='absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-black px-4 py-1 rounded-bl-xl uppercase tracking-tighter'>
                RANK #{idx + 1}
              </div>
              <h3 className='text-lg font-bold text-neutral-900 dark:text-white mb-4 pr-10'>
                {row.weakness}
              </h3>
              <div className='space-y-4'>
                <div className='flex items-center justify-between text-xs font-mono border-b border-neutral-100 dark:border-neutral-800 pb-2'>
                  <span className='text-neutral-400 uppercase'>Opp Score</span>
                  <span className='text-emerald-500 font-black'>
                    {row.opportunityScore}/5
                  </span>
                </div>
                <p className='text-sm text-neutral-500 dark:text-neutral-400 leading-snug'>
                  {row.whyBuildThis}
                </p>
                <div className='grid grid-cols-3 gap-2 mt-4'>
                  <div className='bg-neutral-50 dark:bg-black p-2 rounded-xl text-center'>
                    <div className='text-[8px] text-neutral-400 uppercase'>
                      Freq
                    </div>
                    <div className='text-[10px] font-bold text-neutral-700 dark:text-neutral-300'>
                      {row.frequency}
                    </div>
                  </div>
                  <div className='bg-neutral-50 dark:bg-black p-2 rounded-xl text-center'>
                    <div className='text-[8px] text-neutral-400 uppercase'>
                      Pain
                    </div>
                    <div className='text-[10px] font-bold text-neutral-700 dark:text-neutral-300'>
                      {row.pain}
                    </div>
                  </div>
                  <div className='bg-neutral-50 dark:bg-black p-2 rounded-xl text-center'>
                    <div className='text-[8px] text-neutral-400 uppercase'>
                      Moat
                    </div>
                    <div className='text-[10px] font-bold text-neutral-700 dark:text-neutral-300'>
                      {row.moat}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Strategic Recommendations */}
      <section className='grid md:grid-cols-2 gap-8'>
        <div className='bg-neutral-900 dark:bg-black text-white rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-2xl border border-neutral-800 flex flex-col justify-between group'>
          <div>
            <div className='h-12 w-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-8 border border-blue-500/30'>
              <Lightbulb className='w-6 h-6 text-blue-400' />
            </div>
            <h2 className='text-2xl md:text-3xl font-bold mb-4 group-hover:text-blue-400 transition-colors tracking-tight'>
              Strongest Opportunity
            </h2>
            <p className='text-lg leading-relaxed text-neutral-400 font-medium'>
              {report.strategicRecommendations?.strongestOpportunity}
            </p>
          </div>
          <div className='mt-12 text-[10px] font-black uppercase text-blue-500/50 tracking-widest'>
            Strategic Path A
          </div>
        </div>

        <div className='space-y-8'>
          <div className='bg-emerald-50 dark:bg-emerald-950/20 rounded-3xl p-8 border border-emerald-100 dark:border-emerald-900/30'>
            <h2 className='text-lg font-bold text-emerald-900 dark:text-emerald-400 mb-2 flex items-center gap-2 uppercase tracking-tighter'>
              <CheckCircle className='w-4 h-4' />
              Quick Win Alternative
            </h2>
            <p className='text-sm text-emerald-800/80 dark:text-emerald-300 font-medium leading-relaxed'>
              {report.strategicRecommendations?.quickWinAlternative}
            </p>
          </div>

          <div className='bg-red-50 dark:bg-red-950/20 rounded-3xl p-8 border border-red-100 dark:border-red-900/30'>
            <h2 className='text-lg font-bold text-red-900 dark:text-red-400 mb-2 flex items-center gap-2 uppercase tracking-tighter'>
              <TriangleAlert className='w-4 h-4' />
              Strategic Risk (Red Flags)
            </h2>
            <p className='text-sm text-red-800/80 dark:text-red-300 font-medium leading-relaxed'>
              {report.strategicRecommendations?.redFlags}
            </p>
          </div>
        </div>
      </section>

      {/* Validation Next Steps */}
      <section className='bg-blue-600 dark:bg-blue-700 text-white rounded-[2rem] md:rounded-[40px] p-6 md:p-12 shadow-2xl shadow-blue-500/20 relative overflow-hidden'>
        <div className='absolute -bottom-10 -right-10 opacity-20'>
          <CheckCircle className='w-64 h-64 rotate-12' />
        </div>
        <h2 className='text-2xl md:text-3xl font-black mb-8 md:mb-12 uppercase tracking-tighter'>
          Validation Roadmap
        </h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 relative z-10'>
          {report.validationNextSteps?.map((step, i) => (
            <div
              key={i}
              className='bg-white/10 p-8 rounded-3xl border border-white/10 backdrop-blur-md hover:bg-white/20 transition-all cursor-default'
            >
              <div className='text-xs font-black text-blue-200 mb-2 uppercase tracking-widest'>
                Phase 0{i + 1}
              </div>
              <p className='text-base font-bold leading-tight'>{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sources are now shown in the Resources tab */}
    </div>
  )
}

export default ReportView
