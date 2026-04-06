import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import * as Sentry from '@sentry/nextjs'
import { logger } from '@/lib/logger'
import { analyzeLimiter, applyRateLimit, redis } from '@/lib/rateLimit'
import { getCachedAnalysis, setCachedAnalysis } from '@/lib/analysisCache'
import { MAX_CREDITS } from '@/lib/planUtils'
import { PerformanceTimer } from '@/lib/monitoring'
import { AnalysisReport } from '@/types'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

// Module-level singleton — instantiated once, not per request
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

// ── Credit helpers (direct table ops — bypasses SQL RPC permission issues) ──

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AdminDb = any

async function reserveCredit(
  db: AdminDb,
  userId: string
): Promise<{ error: string | null }> {
  // Fetch profile
  const { data: profile, error: profileErr } = await db
    .from('profiles')
    .select('credits_used')
    .eq('id', userId)
    .single()

  if (profileErr || !profile) {
    logger.error('[analyze] profile fetch failed', { userId, error: profileErr?.message })
    return { error: 'Profile not found' }
  }

  // Fetch active subscription (optional — defaults to hobby)
  const { data: subscription } = await db
    .from('subscriptions')
    .select('plan_slug')
    .eq('user_id', userId)
    .in('status', ['active', 'trialing'])
    .limit(1)
    .maybeSingle()

  const planSlug: string = (subscription as { plan_slug?: string } | null)?.plan_slug || 'hobby'
  const maxCredits: number = MAX_CREDITS[planSlug] ?? 3

  if ((profile as { credits_used: number }).credits_used >= maxCredits) {
    return { error: 'NO_CREDITS_REMAINING' }
  }

  const currentCredits = (profile as { credits_used: number }).credits_used

  // Increment credits_used
  const { error: updateErr } = await db
    .from('profiles')
    .update({
      credits_used: currentCredits + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (updateErr) {
    logger.error('[analyze] credits_used increment failed', { userId, error: updateErr.message })
    return { error: updateErr.message }
  }

  return { error: null }
}

async function refundCredit(db: AdminDb, userId: string): Promise<void> {
  const { data: profile } = await db
    .from('profiles')
    .select('credits_used')
    .eq('id', userId)
    .single()

  const credits = (profile as { credits_used: number } | null)?.credits_used ?? 0
  if (credits <= 0) return

  await db
    .from('profiles')
    .update({
      credits_used: credits - 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
}

// ── Analysis prompt ───────────────────────────────────────────────────────────

function buildAnalysisPrompt(query: string): string {
  return `Analyze the following competitive intelligence query and
respond with a detailed JSON report. Your goal is to identify systematic product weaknesses that represent genuine business opportunities by analyzing real user feedback.

Follow this Research Protocol strictly:
1. Use Google Search to find high-signal sources: Reddit, G2, Capterra, Trustpilot, App Store, ProductHunt, Hacker News.
2. Extract specific complaints, frequency indicators, intensity signals ("dealbreaker", "switching"), and workaround mentions.
3. Group similar complaints into weakness patterns.
4. Assess Frequency, Pain Intensity, Monetization Potential, and Competitive Moat.

Query: "${query}"

Respond ONLY with this exact JSON structure — no other text, no markdown, no code blocks, no preamble. Your entire response must be parseable JSON:

{
  "executiveSummary": "2-3 paragraph executive summary of findings",
  "weaknessMatrix": [
    {
      "name": "string (name of weakness)",
      "frequency": "High|Medium|Low",
      "frequencyPercentage": "string (e.g. 45%)",
      "painIntensity": "Severe|Moderate|Mild",
      "opportunityScore": 4,
      "quotes": ["string (real or representative quote)"],
      "significance": "string",
      "competitorsAffected": [{"name": "string", "failureMode": "string"}],
      "monetizationSignals": "string"
    }
  ],
  "comparisonTable": [
    {
      "weakness": "string",
      "frequency": "string",
      "pain": "string",
      "moat": "string",
      "opportunityScore": 4,
      "whyBuildThis": "string"
    }
  ],
  "strategicRecommendations": {
    "strongestOpportunity": "string",
    "quickWinAlternative": "string",
    "redFlags": "string"
  },
  "validationNextSteps": ["string"],
  "sources": [{"title": "string (name of the source)", "uri": "string (full URL)"}]
}

Avoid generic ratings. Be specific (e.g., "can't bulk-edit tasks on mobile" vs "poor UX"). Focus on paying users.
CRITICAL: In the "sources" array, include ALL URLs you referenced or found during your research. Each source must have a descriptive "title" and a valid full "uri". Include at least 5-10 sources. Make the analysis deep, specific, and actionable. Use real market knowledge. Be honest about weaknesses.`
}

// ── Claude streaming ──────────────────────────────────────────────────────────

async function streamWithFallback(
  prompt: string,
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder
): Promise<string> {
  const models = [
    'claude-haiku-4-5-20251001',
  ]

  let lastError: unknown
  let fullText = ''

  for (const model of models) {
    try {
      logger.info('[analyze] Trying model', { model })
      fullText = ''

      const anthropicStream = await anthropic.messages.stream({
        model,
        max_tokens: 4096,
        system: `You are an expert competitive intelligence analyst.
Your job is to analyze competitors and market positioning with deep,
actionable insights. Always respond with valid JSON only — no markdown,
no code blocks, no preamble. Your entire response must be parseable JSON.`,
        messages: [{ role: 'user', content: prompt }],
      })

      for await (const event of anthropicStream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          const chunkText = event.delta.text
          fullText += chunkText
          controller.enqueue(
            encoder.encode(
              "data: " + JSON.stringify({ chunk: chunkText }) + "\n\n"
            )
          )
        }
      }

      logger.info('[analyze] Model succeeded', { model })
      return fullText

    } catch (err: unknown) {
      const error = err as { status?: number }
      lastError = err
      logger.warn('[analyze] Model failed, trying next', { model, status: error?.status })

      if (error?.status === 401 || error?.status === 400 || error?.status === 403) {
        throw err
      }

      continue
    }
  }

  throw lastError
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const timer = new PerformanceTimer('api/analyze')
  try {
    // Authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = authHeader.replace('Bearer ', '')

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    )

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const rateLimitResponse = await applyRateLimit(analyzeLimiter, user.id, req)
    if (rateLimitResponse) return rateLimitResponse

    // Parse & validate body
    const { query } = await req.json()

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    const trimmedQuery = query.trim()

    const MAX_QUERY_LENGTH = 500
    if (trimmedQuery.length > MAX_QUERY_LENGTH) {
      return NextResponse.json(
        { error: `Query must be ${MAX_QUERY_LENGTH} characters or less` },
        { status: 400 }
      )
    }

    const ALLOWED_QUERY_PATTERN = /^[a-zA-Z0-9\s\-_.,!?'"()&@#%+\/:\\]+$/
    if (!ALLOWED_QUERY_PATTERN.test(trimmedQuery)) {
      return NextResponse.json(
        { error: 'Query contains invalid characters' },
        { status: 400 }
      )
    }

    logger.info('[analyze] Request received', {
      userId: user.id,
      queryLength: trimmedQuery.length
    })

    // Service role client for all DB writes
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // In-flight request lock (prevents duplicate concurrent requests)
    let lockAcquired = false
    const lockKey = `analyze:lock:${user.id}`
    try {
      const r = redis()
      const result = await r.set(lockKey, '1', { nx: true, ex: 60 })
      lockAcquired = result === 'OK'
    } catch (lockErr) {
      logger.warn('[analyze] Lock acquisition failed — proceeding without lock', {
        error: (lockErr as Error).message,
      })
      lockAcquired = true
    }

    if (!lockAcquired) {
      return NextResponse.json(
        { error: 'An analysis is already in progress. Please wait.' },
        { status: 429 }
      )
    }

    try {
      // ── Cached result path ─────────────────────────────────────────
      const cached = await getCachedAnalysis(trimmedQuery, user.id)
      if (cached) {
        logger.info('[analyze] Cache HIT', { userId: user.id })

        const encoder = new TextEncoder()
        const stream = new ReadableStream({
          async start(controller) {
            try {
              const { error: reserveErr } = await reserveCredit(supabaseAdmin, user.id)

              if (reserveErr) {
                if (reserveErr === 'NO_CREDITS_REMAINING') {
                  controller.enqueue(encoder.encode("data: " + JSON.stringify({ error: 'No credits remaining. Please upgrade your plan.' }) + "\n\n"))
                } else {
                  controller.enqueue(encoder.encode("data: " + JSON.stringify({ error: reserveErr }) + "\n\n"))
                }
                return
              }

              const { error: saveError } = await supabaseAdmin
                .from('analysis_history')
                .insert({
                  user_id: user.id,
                  query: trimmedQuery,
                  report: cached,
                  created_at: new Date().toISOString(),
                })

              if (saveError) {
                await refundCredit(supabaseAdmin, user.id)
                controller.enqueue(encoder.encode("data: " + JSON.stringify({ error: 'Failed to save analysis.' }) + "\n\n"))
              } else {
                controller.enqueue(encoder.encode("data: " + JSON.stringify({ done: true, report: cached }) + "\n\n"))
              }
            } catch (err) {
              await refundCredit(supabaseAdmin, user.id)
              controller.enqueue(encoder.encode("data: " + JSON.stringify({ error: 'Failed to save analysis.' }) + "\n\n"))
            } finally {
              timer.stop({ cached: true })
              controller.close()
              await redis().del(lockKey).catch(() => {})
            }
          }
        })

        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
            'X-Cache': 'HIT'
          }
        })
      }

      if (!process.env.ANTHROPIC_API_KEY) throw new Error('Server configuration error')

      // ── Fresh analysis path ────────────────────────────────────────
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        async start(controller) {
          try {
            // Reserve credit BEFORE making the API call
            const { error: reserveErr } = await reserveCredit(supabaseAdmin, user.id)

            if (reserveErr) {
              if (reserveErr === 'NO_CREDITS_REMAINING') {
                controller.enqueue(encoder.encode("data: " + JSON.stringify({ error: 'No credits remaining. Please upgrade your plan.' }) + "\n\n"))
              } else {
                controller.enqueue(encoder.encode("data: " + JSON.stringify({ error: reserveErr }) + "\n\n"))
              }
              return
            }

            const prompt = buildAnalysisPrompt(trimmedQuery)
            const fullText = await streamWithFallback(prompt, controller, encoder)

            // Parse the response
            let parsedReport: AnalysisReport
            try {
              let cleanedText = fullText.trim()
              cleanedText = cleanedText.replace(/^```json\n?/, '').replace(/^```\n?/, '')
              cleanedText = cleanedText.replace(/\n?```\n?$/, '').trim()

              const json = JSON.parse(cleanedText)
              parsedReport = {
                executiveSummary: json.executiveSummary || '',
                weaknessMatrix: (json.weaknessMatrix || []).map((w: Record<string, unknown>) => ({
                  ...w,
                  quotes: (w.quotes as string[]) || [],
                  competitorsAffected: (w.competitorsAffected as unknown[]) || []
                })),
                comparisonTable: json.comparisonTable || [],
                strategicRecommendations: json.strategicRecommendations || {
                  strongestOpportunity: '',
                  quickWinAlternative: '',
                  redFlags: ''
                },
                validationNextSteps: json.validationNextSteps || [],
                sources: json.sources || []
              } as AnalysisReport
            } catch (parseErr) {
              Sentry.captureException(parseErr)
              parsedReport = {
                executiveSummary: fullText,
                weaknessMatrix: [],
                comparisonTable: [],
                strategicRecommendations: { strongestOpportunity: '', quickWinAlternative: '', redFlags: '' },
                validationNextSteps: [],
                sources: [],
              }
            }

            try {
              const { error: saveError } = await supabaseAdmin
                .from('analysis_history')
                .insert({
                  user_id: user.id,
                  query: trimmedQuery,
                  report: parsedReport,
                  created_at: new Date().toISOString(),
                })

              if (saveError) {
                await refundCredit(supabaseAdmin, user.id)
                logger.error('[analyze] Failed to save', { error: saveError })
                controller.enqueue(encoder.encode("data: " + JSON.stringify({ error: 'Failed to save analysis results.' }) + "\n\n"))
              } else {
                await setCachedAnalysis(trimmedQuery, user.id, parsedReport)
                controller.enqueue(encoder.encode("data: " + JSON.stringify({ done: true, report: parsedReport }) + "\n\n"))
              }
            } catch (saveErr) {
              await refundCredit(supabaseAdmin, user.id)
              logger.error('[analyze] Failed to save', { error: saveErr })
              controller.enqueue(encoder.encode("data: " + JSON.stringify({ error: 'Failed to save analysis results.' }) + "\n\n"))
            }

          } catch (err: unknown) {
            await refundCredit(supabaseAdmin, user.id)

            const error = err as { status?: number; message?: string }

            if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota')) {
              Sentry.captureMessage('Claude API rate limit hit', {
                level: 'warning',
                tags: { source: 'claude_stream' }
              })
              controller.enqueue(
                encoder.encode(
                  "data: " + JSON.stringify({
                    error: 'High demand — please try again in 60 seconds.',
                    retryAfter: 60
                  }) + "\n\n"
                )
              )
            } else if (error?.status === 529 || error?.message?.includes('Overloaded')) {
              Sentry.captureMessage('Claude API overloaded', {
                level: 'warning',
                tags: { source: 'claude_stream' },
              })
              controller.enqueue(
                encoder.encode(
                  "data: " + JSON.stringify({
                    error: 'Service is busy. Please try again in a moment.',
                  }) + "\n\n"
                )
              )
            } else if (error?.status === 401 || error?.status === 403) {
              Sentry.captureException(
                new Error('Claude API authentication failed'),
                { tags: { source: 'claude_stream' } }
              )
              controller.enqueue(
                encoder.encode(
                  "data: " + JSON.stringify({
                    error: 'Analysis service configuration error.',
                  }) + "\n\n"
                )
              )
            } else {
              const errObj = err instanceof Error ? err : new Error(String(err))
              Sentry.captureException(errObj, {
                tags: { source: 'claude_stream', userId: user.id },
                extra: { query: trimmedQuery, errorMessage: errObj.message }
              })
              logger.error('[analyze] Stream error', { error: errObj.message, userId: user.id })
              controller.enqueue(
                encoder.encode(
                  "data: " + JSON.stringify({
                    error: 'Analysis failed. Please try again.'
                  }) + "\n\n"
                )
              )
            }
          } finally {
            timer.stop({ cached: false, queryLength: trimmedQuery.length })
            controller.close()
            await redis().del(lockKey).catch(() => {})
          }
        }
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'X-Accel-Buffering': 'no',
        },
      })

    } catch (err) {
      await redis().del(lockKey).catch(() => {})
      throw err
    }
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    logger.error('[analyze] Server error', { error: err.message, stack: err.stack })
    Sentry.captureException(err)

    if (err.message?.includes('429') || err.message?.includes('quota') || err.message?.includes('rate limit')) {
      return NextResponse.json(
        { error: 'API quota exceeded. Please wait before trying again.' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: 'An internal error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
