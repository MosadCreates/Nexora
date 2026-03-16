import React from 'react'
import { motion } from 'framer-motion'
import {
  Check,
  X,
  Zap,
  Globe,
  Brain,
  Map,
  Mail,
  Code,
  FileText,
  Eye,
  Database,
  Gauge,
  Server,
  Users,
  Palette,
  Shield,
  Building
} from 'lucide-react'
import {
  getPlanConfig,
  FEATURE_METADATA,
  FeatureAccess
} from '../../lib/planFeatures'

interface PlanFeatureListProps {
  plan: string
  compact?: boolean
}

const FEATURE_ICONS: Record<string, React.ReactNode> = {
  competitiveScans: <Zap className='w-4 h-4' />,
  marketDriftMonitoring: <Globe className='w-4 h-4' />,
  sentimentSynthesis: <Brain className='w-4 h-4' />,
  strategicMapping: <Map className='w-4 h-4' />,
  weeklyNewsletters: <Mail className='w-4 h-4' />,
  customApiAccess: <Code className='w-4 h-4' />,
  exportableReports: <FileText className='w-4 h-4' />,
  foresightEngine: <Eye className='w-4 h-4' />,
  customDataIngestion: <Database className='w-4 h-4' />,
  priorityDataAccess: <Gauge className='w-4 h-4' />,
  selfHostingSupport: <Server className='w-4 h-4' />,
  analystConsultations: <Users className='w-4 h-4' />,
  customWhiteLabeling: <Palette className='w-4 h-4' />,
  slaGuarantee: <Shield className='w-4 h-4' />,
  onPremDeployment: <Building className='w-4 h-4' />
}

const AccessBadge: React.FC<{ access: FeatureAccess }> = ({ access }) => {
  if (access === true) {
    return (
      <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'>
        <Check className='w-3 h-3' />
        Included
      </span>
    )
  }

  if (access === false) {
    return (
      <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-500/10 text-neutral-500 border border-neutral-500/20'>
        <X className='w-3 h-3' />
        Upgrade
      </span>
    )
  }

  const colorMap: Record<string, { bg: string; text: string; border: string }> =
    {
      limited: {
        bg: 'bg-amber-500/10',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-500/20'
      },
      essential: {
        bg: 'bg-blue-500/10',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-500/20'
      },
      manual: {
        bg: 'bg-orange-500/10',
        text: 'text-orange-600 dark:text-orange-400',
        border: 'border-orange-500/20'
      },
      'semi-auto': {
        bg: 'bg-cyan-500/10',
        text: 'text-cyan-600 dark:text-cyan-400',
        border: 'border-cyan-500/20'
      },
      full: {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-500/20'
      }
    }

  const colors = colorMap[access] || colorMap.limited
  const label = access.charAt(0).toUpperCase() + access.slice(1)

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${colors.bg} ${colors.text} border ${colors.border}`}
    >
      {label}
    </span>
  )
}

export const PlanFeatureList: React.FC<PlanFeatureListProps> = ({
  plan,
  compact = false
}) => {
  const config = getPlanConfig(plan)
  const featureKeys = Object.keys(config.features)

  if (compact) {
    const includedCount = featureKeys.filter(
      k => config.features[k] !== false
    ).length
    return (
      <div className='text-sm text-neutral-500 dark:text-neutral-400'>
        <span className='text-green-500 font-semibold'>{includedCount}</span> of{' '}
        {featureKeys.length} features included
      </div>
    )
  }

  return (
    <div className='space-y-1 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-white/10 scrollbar-track-transparent pr-2'>
      {featureKeys.map((key, index) => {
        const access = config.features[key]
        const meta = FEATURE_METADATA[key]
        const icon = FEATURE_ICONS[key]

        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.02 }}
            className={`flex items-center justify-between py-2 px-3 rounded-xl transition-colors ${
              access === false
                ? 'bg-neutral-100/50 dark:bg-white/[0.02] opacity-60'
                : 'bg-neutral-50 dark:bg-white/[0.03] hover:bg-neutral-100 dark:hover:bg-white/[0.05]'
            }`}
          >
            <div className='flex items-center gap-3'>
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  access === false
                    ? 'bg-neutral-200 dark:bg-white/5 text-neutral-400'
                    : 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-500 dark:text-blue-400'
                }`}
              >
                {icon}
              </div>
              <div>
                <p
                  className={`text-sm font-medium ${
                    access === false
                      ? 'text-neutral-400'
                      : 'text-black dark:text-white'
                  }`}
                >
                  {meta?.label || key}
                </p>
              </div>
            </div>
            <AccessBadge access={access} />
          </motion.div>
        )
      })}
    </div>
  )
}

export default PlanFeatureList
