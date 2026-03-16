export type EffectivePlan = 'hobby' | 'starter' | 'professional' | 'enterprise';

export interface SubscriptionData {
  plan_slug: string;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

/**
 * Deterministically resolves the user's current effective plan.
 * Handles grace periods for canceled but not-yet-expired subscriptions.
 * plan_slug is preserved in DB for historical accuracy — this resolver
 * is the single source-of-truth for what the user can actually access.
 */
export function resolveEffectivePlan(sub: SubscriptionData | null): EffectivePlan {
  if (!sub) return 'hobby';

  const now = new Date();
  const periodEnd = sub.current_period_end ? new Date(sub.current_period_end) : null;

  // Revoked = immediate loss of access (plan_slug preserved in DB for analytics)
  if (sub.status === 'revoked') {
    return 'hobby';
  }

  // Active or trialing
  if (sub.status === 'active' || sub.status === 'trialing') {
    return sub.plan_slug as EffectivePlan;
  }

  // Canceled but still within period (grace period)
  if (sub.cancel_at_period_end && periodEnd && periodEnd > now) {
    return sub.plan_slug as EffectivePlan;
  }

  // Any other state (past_due, expired, incomplete, canceled past period) falls back to free
  return 'hobby';
}

/**
 * Centralized feature gating logic.
 */
export function hasFeature(plan: EffectivePlan, featureKey: string): boolean {
  const featureMatrix: Record<EffectivePlan, string[]> = {
    hobby: ['basic_scans'],
    starter: ['basic_scans', 'advanced_analytics', 'market_monitoring'],
    professional: ['basic_scans', 'advanced_analytics', 'market_monitoring', 'unlimited_scans', 'api_access'],
    enterprise: ['all'],
  };

  const allowedFeatures = featureMatrix[plan] || featureMatrix.hobby;
  
  if (allowedFeatures.includes('all')) return true;
  return allowedFeatures.includes(featureKey);
}
