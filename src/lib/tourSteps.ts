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
    title: 'Strategic Intelligence Onboarding',
    description: "Welcome to Nexora. You're now equipped with an autonomous market intelligence engine. We'll guide you through the core architecture of your new workspace.",
    targetSelector: null,
    page: '/analysis',
    arrowDirection: null,
  },
  {
    id: 'search-bar',
    icon: '🔍', 
    title: 'Neural Query Interface',
    description: "Initiate your research by submitting a competitor, niche, or specific market query. Our AI swarms will crawl professional networks and reviews to synthesize insights.",
    targetSelector: '[data-tour="search-input"]',
    page: '/analysis',
    arrowDirection: 'down',
  },
  {
    id: 'credits-counter',
    icon: '⚡',
    title: 'Operational Bandwidth',
    description: "Monitor your available intelligence credits here. Each deep-scan utilizes high-performance compute nodes to generate your reports.",
    targetSelector: '[data-tour="credits-counter"]',
    page: '/analysis',
    arrowDirection: 'up',
  },
  {
    id: 'run-analysis',
    icon: '🚀',
    title: 'Execute Synthesis',
    description: "Launch your autonomous analysis. Watch in real-time as the engine processes market signals and builds your strategic matrix.",
    targetSelector: '[data-tour="analyze-button"]',
    page: '/analysis',
    arrowDirection: 'left',
  },
  {
    id: 'analysis-report',
    icon: '📊',
    title: 'Intelligence Matrix',
    description: "Your finalized intelligence report surfaces here. It contains competitor weakness mapping, opportunity scoring, and actionable market positioning.",
    targetSelector: '[data-tour="results-area"]',
    page: '/analysis',
    arrowDirection: 'left',
  },
  {
    id: 'analysis-history',
    icon: '📋',
    title: 'Historical Archive',
    description: "Every intelligence report is permanently archived for your review. Track market drift and competitor evolution over time.",
    targetSelector: '[data-tour="history-list"]',
    page: '/analysis',
    arrowDirection: 'right',
  },
  {
    id: 'download-report',
    icon: '📥',
    title: 'Data Portability',
    description: "Export your findings for internal distribution. We support high-fidelity PDF, structured JSON, and CSV formats across various plan tiers.",
    targetSelector: '[data-tour="download-button"]',
    page: '/analysis',
    arrowDirection: 'up',
  },
  {
    id: 'profile-billing',
    icon: '👤',
    title: 'Command Center',
    description: "Manage your subscription, clear your operational history, or adjust your organizational profile from your primary account hub.",
    targetSelector: '[data-tour="profile-button"]',
    page: 'any',
    arrowDirection: 'up',
  },
  {
    id: 'conclusion',
    icon: '🌟',
    title: 'Onboarding Complete',
    description: "Your strategic onboarding is now finalized. The market is moving — it's time to start your first scan.",
    targetSelector: null,
    page: '/analysis',
    arrowDirection: null,
  }
]
