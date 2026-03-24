import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  History,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  Clock,
  Sparkles,
  FileText,
  AlertCircle,
  Target,
  BarChart3,
  Cpu,
  Fingerprint,
  Activity,
  Zap,
  LayoutGrid,
  Layers,
  ArrowRight
} from 'lucide-react'
import { DraggableCardBody, DraggableCardContainer } from '@/components/ui/draggable-card'
import { AnalysisReport, Weakness } from '@/types'
import { cn } from '@/lib/utils'
import { LoaderTwo } from '@/components/ui/loader'
import { MetricTooltip } from '@/components/dashboard/MetricTooltip'
import { BackgroundBeams } from '@/components/ui/aceternity/background-beams'
import { useState, useEffect, useRef, useMemo } from 'react'

interface Analysis {
  id: string
  query: string
  created_at: string
  report: AnalysisReport
}

interface RecentAnalysesProps {
  analyses: Analysis[]
  loading?: boolean
  onViewReport: (analysis: Analysis) => void
}

// Custom hook for hover intent
function useHoverIntent(delay = 200, velocityThreshold = 0.5) {
  const [isHovered, setIsHovered] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const lastPos = useRef({ x: 0, y: 0, t: 0 })
  const velocity = useRef(0)

  const onMouseMove = (e: React.MouseEvent) => {
    const { clientX: x, clientY: y } = e
    const t = Date.now()
    const dt = t - lastPos.current.t
    if (dt > 0) {
      const dx = x - lastPos.current.x
      const dy = y - lastPos.current.y
      velocity.current = Math.sqrt(dx * dx + dy * dy) / dt
    }
    lastPos.current = { x, y, t }

    if (velocity.current < velocityThreshold) {
      if (!timerRef.current && !isHovered) {
        timerRef.current = setTimeout(() => setIsHovered(true), delay)
      }
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      setIsHovered(false)
    }
  }

  const onMouseLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setIsHovered(false)
  }

  return { isHovered, onMouseMove, onMouseLeave }
}

const SignalBadge = ({ strength }: { strength: 'Strong' | 'Moderate' | 'Weak' }) => {
  const colors = {
    Strong: 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30',
    Moderate: 'bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30',
    Weak: 'bg-slate-50 dark:bg-slate-500/20 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-500/30'
  }
  
  return (
    <div className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 transition-colors", colors[strength])}>
      <Activity className="w-3 h-3" />
      {strength.toUpperCase()}
    </div>
  )
}

const InsightPeek = ({ weakness }: { weakness: Weakness }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    className="absolute -top-32 left-0 right-0 z-50 p-4 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-2xl border border-neutral-200 dark:border-white/10 rounded-2xl shadow-2xl pointer-events-none"
  >
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
        <Zap className="w-3 h-3" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Key Insight</span>
      </div>
      <p className="text-xs text-neutral-800 dark:text-white/90 font-medium line-clamp-2">{weakness.name}</p>
      <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-white/5">
        <span className="text-[9px] text-neutral-400 dark:text-white/40 uppercase tracking-tighter">Opportunity Score</span>
        <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">{weakness.opportunityScore}/5</span>
      </div>
    </div>
  </motion.div>
)

export function RecentAnalyses ({
  analyses,
  loading,
  onViewReport
}: RecentAnalysesProps) {
  const [viewMode, setViewMode] = useState<'memory' | 'timeline'>('memory')

  const getSignalStrength = (weakness: Weakness) => {
    const painMap = { Severe: 1, Moderate: 0.6, Mild: 0.3 }
    const freqMap = { High: 1, Medium: 0.6, Low: 0.3 }
    
    const confidence = 0.85 
    const painScore = painMap[weakness.painIntensity] || 0.5
    const freqScore = freqMap[weakness.frequency] || 0.5
    
    const score = (confidence * 0.5) + (freqScore * 0.3) + (weakness.opportunityScore / 5 * 0.2)
    
    if (score > 0.7) return 'Strong'
    if (score > 0.4) return 'Moderate'
    return 'Weak'
  }

  return (
    <div data-tour="history-list" className='relative bg-white dark:bg-black py-24 min-h-[900px] overflow-hidden'>
      {/* Background Beams - Match DashboardHero */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <BackgroundBeams className='absolute inset-0 opacity-40' />
      </div>

      <div className='relative z-30 max-w-7xl mx-auto px-4'>
        <div className='flex flex-col md:flex-row items-center justify-between mb-20 gap-8'>
          <div className='space-y-4 text-center md:text-left'>
            <div className='inline-flex items-center space-x-3 bg-neutral-100 dark:bg-neutral-900 px-4 py-2 rounded-full border border-neutral-200 dark:border-neutral-800 transition-colors'>
              <Clock className='h-4 w-4 text-blue-500' />
              <span className='text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-widest'>
                Live History
              </span>
            </div>
            <h2 className='text-4xl md:text-6xl font-bold text-black dark:text-white tracking-tight'>
              Recent <span className='text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300'>Analyses</span>
            </h2>
            <div className='flex justify-center md:justify-start mt-2'>
              <MetricTooltip />
            </div>
            <p className='text-lg text-neutral-600 dark:text-neutral-400 max-w-xl font-medium'>
              {viewMode === 'memory' 
                ? 'Explore your historical intelligence archive with our high-depth magnetic stack.'
                : 'Competitive Evolution: Strategic trajectory of identified market opportunities.'}
            </p>
          </div>

          <div className='flex bg-neutral-100 dark:bg-neutral-900 rounded-2xl p-1.5 border border-neutral-200 dark:border-neutral-800 shadow-inner'>
            <button
              onClick={() => setViewMode('memory')}
              className={cn(
                'flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300',
                viewMode === 'memory'
                  ? 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-md border border-neutral-200 dark:border-neutral-700'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
              )}
            >
              <Layers className='w-4 h-4' />
              Memory View
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={cn(
                'flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300',
                viewMode === 'timeline'
                  ? 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-md border border-neutral-200 dark:border-neutral-700'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
              )}
            >
              <Activity className='w-4 h-4' />
              Timeline View
            </button>
          </div>
        </div>

        {loading ? (
          <div className='flex items-center justify-center h-[500px]'>
            <LoaderTwo size='lg' text='Loading Neural Archive...' />
          </div>
        ) : analyses.length === 0 ? (
          <div className='text-center py-32 rounded-[2rem] border-2 border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50'>
            <Fingerprint className='h-12 w-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-6' />
            <h3 className='text-2xl font-bold text-neutral-900 dark:text-white mb-2'>No Signal Detected</h3>
            <p className='text-neutral-500 dark:text-neutral-400 mb-8'>Generate your first report to populate the archive.</p>
          </div>
        ) : (
          <div className={cn(
            "transition-all duration-700",
            viewMode === 'memory' ? "block" : "hidden"
          )}>
            <DraggableCardContainer className='h-[650px] w-full border border-neutral-200 dark:border-neutral-800 rounded-[3rem] bg-neutral-100/40 dark:bg-neutral-900/40 backdrop-blur-xl shadow-2xl relative flex items-center justify-center overflow-visible'>
              <div className='absolute inset-0 overflow-hidden pointer-events-none'>
                <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center'>
                  <p className='text-4xl md:text-8xl font-black text-neutral-200/50 dark:text-neutral-800/20 select-none tracking-tighter uppercase'>
                    Intelligence Archive
                  </p>
                </div>
              </div>
              {analyses.slice(0, 8).map((analysis, index) => (
                <AnalysisCard 
                  key={analysis.id} 
                  analysis={analysis} 
                  index={index} 
                  viewMode="stack"
                  onView={onViewReport} 
                  getSignal={getSignalStrength}
                />
              ))}
            </DraggableCardContainer>
          </div>
        )}

        <AnimatePresence>
          {viewMode === 'timeline' && (
            <motion.div 
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="mt-10"
            >
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white/80 mb-8 flex items-center gap-2">
                <ChevronRight className="w-5 h-5 text-blue-500" />
                AI Understanding Evolution
              </h3>
              <div className="flex gap-8 overflow-x-auto pb-12 scrollbar-hide px-4">
                {analyses.map((analysis, index) => (
                  <div key={analysis.id} className="flex-shrink-0 w-80">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-4 h-4 rounded-full bg-blue-500 shadow-md" />
                      <div className="h-[1px] flex-grow bg-neutral-200 dark:bg-neutral-800" />
                      <span className="text-[10px] font-mono text-neutral-400">M-{index + 100}</span>
                    </div>
                    <AnalysisCard 
                      analysis={analysis} 
                      index={index} 
                      viewMode="timeline"
                      onView={onViewReport} 
                      getSignal={getSignalStrength}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function AnalysisCard({ analysis, index, onView, getSignal, viewMode }: any) {
  const { isHovered, onMouseMove, onMouseLeave } = useHoverIntent()
  const topWeakness = analysis.report?.weaknessMatrix?.[0]
  const signal = topWeakness ? getSignal(topWeakness) : 'Weak'
  
  const stackPos = useMemo(() => ({
    x: (index % 4) * 80 - 120 + Math.random() * 40,
    y: (index % 2) * 50 - 25 + Math.random() * 30,
    rotate: (Math.random() - 0.5) * 15
  }), [index])

  return (
    <DraggableCardBody
      className={cn(
        "w-72 md:w-80 h-[400px] border border-neutral-200 dark:border-neutral-800 group/card relative",
        viewMode === 'stack' ? 'absolute cursor-grab active:cursor-grabbing' : 'relative',
        "bg-white dark:bg-neutral-900"
      )}
      initialPosition={viewMode === 'stack' ? { x: stackPos.x, y: stackPos.y } : { x: 0, y: 0 }}
      dragMode={viewMode === 'stack' ? 'stack' : 'timeline'}
      onDoubleClick={() => onView(analysis)}
    >
      <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none" />
      <div 
        className="h-full p-6 flex flex-col justify-between relative z-10"
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      >
        <AnimatePresence>
          {isHovered && topWeakness && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -top-32 left-0 right-0 z-50 p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl pointer-events-none"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <Zap className="w-3 h-3" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Key Insight</span>
                </div>
                <p className="text-xs text-neutral-900 dark:text-white font-medium line-clamp-2">{topWeakness.name}</p>
                <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <span className="text-[9px] text-neutral-400 uppercase tracking-tighter">Opportunity Score</span>
                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">{topWeakness.opportunityScore}/5</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <SignalBadge strength={signal} />
            <div className="flex flex-col items-end opacity-20 group-hover/card:opacity-100 transition-opacity">
              <span className="text-[8px] font-mono text-neutral-400 tracking-widest uppercase">Node ID</span>
              <span className="text-[9px] font-mono text-neutral-500">AX-00{index}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Sparkles className="w-3 h-3" />
              <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">Pattern Analysis</span>
            </div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white line-clamp-3 tracking-tight group-hover/card:text-blue-600 dark:group-hover/card:text-blue-400 transition-colors">
              {analysis.query}
            </h3>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4 text-neutral-400 dark:text-neutral-500 text-[10px] font-mono">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(analysis.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              {analysis.report?.sources?.length || 0} Nodes
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <span className="text-[8px] font-mono text-neutral-400 uppercase">Analysis Complete</span>
            <button 
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest transition-all"
              onClick={() => onView(analysis)}
            >
              Open
              <ArrowRight className="w-3 h-3 group-hover/card:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </DraggableCardBody>
  )
}
