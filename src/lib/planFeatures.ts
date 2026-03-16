/**
 * Plan Feature Matrix Configuration
 * Defines all features and their availability per plan
 */

export type PlanType = 'hobby' | 'starter' | 'professional' | 'enterprise';

export type FeatureAccess = boolean | 'limited' | 'essential' | 'manual' | 'semi-auto' | 'full';

export interface PlanConfig {
  name: string;
  credits: number;
  maxSources: number;
  features: Record<string, FeatureAccess>;
}

export const PLAN_CONFIGS: Record<PlanType, PlanConfig> = {
  hobby: {
    name: 'Hobby',
    credits: 3, // 3 scans/month
    maxSources: 3,
    features: {
      competitiveScans: true,
      marketDriftMonitoring: true,
      sentimentSynthesis: true,
      strategicMapping: true,
      weeklyNewsletters: true,
      customApiAccess: true,
      exportableReports: true,
      foresightEngine: 'limited',
      customDataIngestion: 'manual',
      priorityDataAccess: false,
      selfHostingSupport: false,
      analystConsultations: false,
      customWhiteLabeling: false,
      slaGuarantee: false,
      onPremDeployment: false,
    },
  },
  starter: {
    name: 'Starter',
    credits: 20, // 20 scans/month
    maxSources: 15,
    features: {
      competitiveScans: true,
      marketDriftMonitoring: true,
      sentimentSynthesis: true,
      strategicMapping: true,
      weeklyNewsletters: true,
      customApiAccess: true,
      exportableReports: true,
      foresightEngine: 'essential',
      customDataIngestion: 'semi-auto',
      priorityDataAccess: false,
      selfHostingSupport: false,
      analystConsultations: false,
      customWhiteLabeling: false,
      slaGuarantee: false,
      onPremDeployment: false,
    },
  },
  professional: {
    name: 'Professional',
    credits: 60, // 60 scans/month
    maxSources: 40,
    features: {
      competitiveScans: true,
      marketDriftMonitoring: true,
      sentimentSynthesis: true,
      strategicMapping: true,
      weeklyNewsletters: true,
      customApiAccess: true,
      exportableReports: true,
      foresightEngine: 'full',
      customDataIngestion: 'full',
      priorityDataAccess: true,
      selfHostingSupport: true,
      analystConsultations: false,
      customWhiteLabeling: false,
      slaGuarantee: false,
      onPremDeployment: false,
    },
  },
  enterprise: {
    name: 'Enterprise',
    credits: 500, // Custom high limit, but not unlimited
    maxSources: 100,
    features: {
      competitiveScans: true,
      marketDriftMonitoring: true,
      sentimentSynthesis: true,
      strategicMapping: true,
      weeklyNewsletters: true,
      customApiAccess: true,
      exportableReports: true,
      foresightEngine: 'full',
      customDataIngestion: 'full',
      priorityDataAccess: true,
      selfHostingSupport: true,
      analystConsultations: true,
      customWhiteLabeling: true,
      slaGuarantee: true,
      onPremDeployment: true,
    },
  },
};

// Feature display metadata
export const FEATURE_METADATA: Record<string, { label: string; description: string }> = {
  competitiveScans: { label: 'Competitive Scans', description: 'Analyze competitor websites and strategies' },
  marketDriftMonitoring: { label: 'Market Drift Monitoring', description: 'Track market changes in real-time' },
  sentimentSynthesis: { label: 'Sentiment Synthesis', description: 'AI-powered sentiment analysis' },
  strategicMapping: { label: 'Strategic Mapping', description: 'Visual strategy mapping tools' },
  weeklyNewsletters: { label: 'Weekly Newsletters', description: 'Curated market intelligence reports' },
  customApiAccess: { label: 'Custom API Access', description: 'Programmatic access to data' },
  exportableReports: { label: 'Exportable Reports', description: 'Download reports in multiple formats' },
  foresightEngine: { label: 'Foresight Engine', description: 'Predictive market analysis' },
  customDataIngestion: { label: 'Custom Data Ingestion', description: 'Import your own data sources' },
  priorityDataAccess: { label: 'Priority Data Access', description: 'Faster data processing queue' },
  selfHostingSupport: { label: 'Self-Hosting Support', description: 'Deploy on your infrastructure' },
  analystConsultations: { label: 'Analyst Consultations', description: 'Direct access to human analysts' },
  customWhiteLabeling: { label: 'Custom White-labeling', description: 'Brand reports with your logo' },
  slaGuarantee: { label: 'SLA Guarantee', description: 'Guaranteed uptime and support' },
  onPremDeployment: { label: 'On-prem Deployment', description: 'Full on-premises installation' },
};

// Helper functions
export function getPlanConfig(plan: string): PlanConfig {
  const normalizedPlan = plan.toLowerCase() as PlanType;
  return PLAN_CONFIGS[normalizedPlan] || PLAN_CONFIGS.hobby;
}

export function hasFeature(plan: string, featureKey: string): boolean {
  const config = getPlanConfig(plan);
  const access = config.features[featureKey];
  return access !== false;
}

export function getFeatureLevel(plan: string, featureKey: string): FeatureAccess {
  const config = getPlanConfig(plan);
  return config.features[featureKey] ?? false;
}

export function formatFeatureValue(access: FeatureAccess): string {
  if (access === true) return '✓';
  if (access === false) return '—';
  return access.charAt(0).toUpperCase() + access.slice(1);
}
