/**
 * Plan Utilities — Shared by webhook, checkout, and analyze routes.
 * Server-only module (no 'use client').
 */

export const PLAN_RANK: Record<string, number> = {
  hobby: 0,
  starter: 1,
  professional: 2,
  enterprise: 3,
}

export const MAX_CREDITS: Record<string, number> = {
  hobby: 3,
  starter: 20,
  professional: 60,
  enterprise: 500,
}

/**
 * Maps a Polar.sh product ID to a plan slug.
 * Returns `null` for unknown product IDs (caller must handle).
 */
export function getProductPlanSlug(productId: string): string | null {
  const mapping: Record<string, string> = {}

  const ids: Record<string, (string | undefined)[]> = {
    starter: [
      process.env.NEXT_PUBLIC_POLAR_STARTER_MONTHLY_ID,
      process.env.NEXT_PUBLIC_POLAR_STARTER_YEARLY_ID,
    ],
    professional: [
      process.env.NEXT_PUBLIC_POLAR_PROFESSIONAL_MONTHLY_ID,
      process.env.NEXT_PUBLIC_POLAR_PROFESSIONAL_YEARLY_ID,
    ],
  }

  for (const [plan, envIds] of Object.entries(ids)) {
    for (const id of envIds) {
      if (id) mapping[id] = plan
    }
  }

  return mapping[productId] ?? null
}
