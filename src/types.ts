export type SubscriptionPlan = 'hobby' | 'starter' | 'professional' | 'enterprise';

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  credits_used: number;
  created_at: string;
}

export interface Weakness {
  name: string;
  frequency: 'High' | 'Medium' | 'Low';
  frequencyPercentage: string;
  painIntensity: 'Severe' | 'Moderate' | 'Mild';
  opportunityScore: number;
  quotes: string[];
  significance: string;
  competitorsAffected: {
    name: string;
    failureMode: string;
  }[];
  monetizationSignals: string;
}

export interface ComparisonRow {
  weakness: string;
  frequency: string;
  pain: string;
  moat: string;
  opportunityScore: number;
  whyBuildThis: string;
}

export interface AnalysisReport {
  executiveSummary: string;
  weaknessMatrix: Weakness[];
  comparisonTable: ComparisonRow[];
  strategicRecommendations: {
    strongestOpportunity: string;
    quickWinAlternative: string;
    redFlags: string;
  };
  validationNextSteps: string[];
  sources: { title: string; uri: string }[];
}

export enum AnalysisStep {
  IDLE = 'IDLE',
  RESEARCHING = 'RESEARCHING',
  CLUSTERING = 'CLUSTERING',
  SCORING = 'SCORING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}