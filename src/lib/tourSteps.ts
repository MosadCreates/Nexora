export interface TourStep {
  id: string
  icon: string
  title: string
  description: string
  targetSelector: string | null  // CSS selector for the target element
  page: string  // which page this step is on
  arrowDirection: 'up' | 'down' | 'left' | 'right' | null
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    icon: '🎯',
    title: 'Welcome to Nexora',
    description: "You're about to get AI-powered intelligence on your competitors. This quick tour will show you everything you need to know. It takes less than 2 minutes.",
    targetSelector: null,
    page: '/analysis',
    arrowDirection: null,
  },
  {
    id: 'search-bar',
    icon: '🔍', 
    title: 'Ask About Any Competitor',
    description: "Type any competitor name, product, or market here. For example: 'Analyze Notion's weaknesses' or 'Compare Slack vs Teams'. Nexora's AI does the rest.",
    targetSelector: '[data-tour="search-input"]',
    page: '/analysis',
    arrowDirection: 'down',
  },
  {
    id: 'credits-counter',
    icon: '⚡',
    title: 'Your Analysis Credits',
    description: "Each analysis costs 1 credit. Free plan includes 3 credits per month. Upgrade anytime for more. Your remaining credits are always shown here.",
    targetSelector: '[data-tour="credits-counter"]',
    page: '/analysis',
    arrowDirection: 'up',
  },
  {
    id: 'run-analysis',
    icon: '🚀',
    title: 'Run Your First Analysis',
    description: "Click this button to start an AI analysis. Results stream in real-time — you'll see insights appearing within seconds, not minutes.",
    targetSelector: '[data-tour="analyze-button"]',
    page: '/analysis',
    arrowDirection: 'left',
  },
  {
    id: 'analysis-report',
    icon: '📊',
    title: 'Your Intelligence Report',
    description: "After analysis, your full report appears here. It includes competitor weaknesses, market opportunities, positioning gaps, and strategic recommendations.",
    targetSelector: '[data-tour="results-area"]',
    page: '/analysis',
    arrowDirection: 'left',
  },
  {
    id: 'analysis-history',
    icon: '📋',
    title: 'Your Analysis History',
    description: "Every analysis you run is saved here. Access past reports anytime, compare competitors over time, and track market changes.",
    targetSelector: '[data-tour="history-list"]',
    page: '/analysis',
    arrowDirection: 'right',
  },
  {
    id: 'download-report',
    icon: '📥',
    title: 'Export Your Reports',
    description: "Download any analysis as PDF, JSON, or CSV. Share insights with your team or import them into your existing workflow.",
    targetSelector: '[data-tour="download-button"]',
    page: '/analysis',
    arrowDirection: 'up',
  },
  {
    id: 'profile-billing',
    icon: '👤',
    title: 'Manage Your Account',
    description: "Access your profile, manage your subscription, upgrade your plan, and track your usage — all from here.",
    targetSelector: '[data-tour="profile-button"]',
    page: 'any',
    arrowDirection: 'up',
  }
]
