// FIX #1: Edge Runtime — 30s timeout on Vercel Free (vs 10s serverless)
export const runtime = 'edge'
export const maxDuration = 30

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import * as Sentry from '@sentry/nextjs'
import { logger } from '@/lib/logger'
import { analyzeLimiter, applyRateLimit, redis } from '@/lib/rateLimit'
import { getCachedAnalysis, setCachedAnalysis } from '@/lib/analysisCache'
import { PerformanceTimer } from '@/lib/monitoring'
import { AnalysisReport } from '@/types'

// Module-level singleton — instantiated once, not per request
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

// ── FIX #1: Optimized analysis prompt (fewer tokens, faster responses) ──────

function buildAnalysisPrompt(query: string): string {
  return `You are a competitive intelligence analyst.
Analyze: "${query}"

Respond ONLY with this JSON (no markdown, no code blocks):
{
  "executiveSummary": "3-4 sentences summarizing key findings",
  "weaknessMatrix": [
    {
      "name": "weakness name",
      "frequency": "High|Medium|Low",
      "frequencyPercentage": "45%",
      "painIntensity": "Severe|Moderate|Mild",
      "opportunityScore": 8,
      "quotes": ["representative user complaint"],
      "significance": "why this matters",
      "competitorsAffected": [{"name": "Company", "failureMode": "how they fail"}],
      "monetizationSignals": "revenue opportunity description"
    }
  ],
  "comparisonTable": [
    {
      "weakness": "weakness name",
      "frequency": "High",
      "pain": "Severe",
      "moat": "Hard",
      "opportunityScore": 8,
      "whyBuildThis": "specific reason"
    }
  ],
  "strategicRecommendations": {
    "strongestOpportunity": "specific opportunity",
    "quickWinAlternative": "faster win option",
    "redFlags": "risks to avoid"
  },
  "validationNextSteps": ["specific action to validate"],
  "sources": [{"title": "Source name", "uri": "https://example.com"}]
}

Include 3-5 items in weaknessMatrix and comparisonTable.
Include 3-5 validation steps and 5+ sources.
Be specific and actionable. Use real market knowledge.`
}

// ── FIX #5 + #8: Claude streaming with fallback models + AbortSignal ────────

async function streamWithFallback(
  prompt: string,
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  signal?: AbortSignal
): Promise<string> {
  // FIX #8: Two models — cheap primary + quality fallback
  const models = [
    'claude-haiku-4-5-20251014',
    'claude-sonnet-4-5-20250514',
  ]

  let lastError: unknown
  let fullText = ''

  for (const model of models) {
    try {
      logger.info('[analyze] Trying model', { model })
      fullText = ''

      // FIX #5: Check if already aborted before starting
      if (signal?.aborted) {
        throw new Error('CLIENT_DISCONNECTED')
      }

      const anthropicStream = anthropic.messages.stream({
        model,
        max_tokens: 6000,
        system: `You are an expert competitive intelligence analyst.
Respond ONLY with valid JSON. No markdown, no code fences, no explanation text.
Your entire response must start with '{' and be parseable as JSON.
Be concise — keep each text field under 3 sentences. Include 3-5 items in each array.`,
        messages: [
          { role: 'user', content: prompt },
          { role: 'assistant', content: '{' },
        ],
      })

      // Prefill means Claude continues from '{', so we prepend it back
      fullText = '{'

      for await (const event of anthropicStream) {
        // FIX #5: Check for client disconnect between chunks
        if (signal?.aborted) {
          throw new Error('CLIENT_DISCONNECTED')
        }

        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          const chunkText = event.delta.text
          fullText += chunkText
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ chunk: chunkText })}\n\n`
            )
          )
        }
      }

      logger.info('[analyze] Model succeeded', {
        model,
        responseLength: fullText.length,
      })
      return fullText
    } catch (err: unknown) {
      const error = err as { status?: number; message?: string }

      // FIX #5: Client disconnected — propagate immediately, don't retry
      if (error?.message === 'CLIENT_DISCONNECTED') {
        throw err
      }

      lastError = err
      logger.warn('[analyze] Model failed, trying next', {
        model,
        status: error?.status,
        message: error?.message,
      })

      // Don't retry auth errors
      if (
        error?.status === 401 ||
        error?.status === 400 ||
        error?.status === 403
      ) {
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
  const signal = req.signal // FIX #5

  try {
    // ── Authentication ──────────────────────────────────────────────
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
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ── Rate limiting ───────────────────────────────────────────────
    const rateLimitResponse = await applyRateLimit(analyzeLimiter, user.id, req)
    if (rateLimitResponse) return rateLimitResponse

    // ── Parse & validate body ───────────────────────────────────────
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
      queryLength: trimmedQuery.length,
    })

    // ── Service role client (FIX #13: connection optimization) ─────
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: { persistSession: false, autoRefreshToken: false },
        global: {
          headers: {
            'x-connection-hint': 'read-write',
          },
        },
      }
    )

    // ── In-flight request lock (FIX #6: fail-closed) ────────────────
    let lockAcquired = false
    const lockKey = `analyze:lock:${user.id}`
    try {
      const r = redis()
      const result = await r.set(lockKey, '1', { nx: true, ex: 30 })
      lockAcquired = result === 'OK'
    } catch (lockErr) {
      // FIX #6: Fail CLOSED — deny request if Redis is unavailable
      const errMsg = (lockErr as Error).message
      logger.error('[analyze] Redis lock failed — denying request', {
        error: errMsg,
      })
      Sentry.captureMessage('Redis lock acquisition failed', {
        level: 'error',
        extra: { error: errMsg },
      })
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again in a moment.' },
        { status: 503 }
      )
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
              // FIX #2: Atomic RPC credit reservation
              const { error: reserveError } = await supabaseAdmin.rpc(
                'reserve_analysis_credit',
                { p_user_id: user.id }
              )

              if (reserveError) {
                if (reserveError.message?.includes('NO_CREDITS_REMAINING')) {
                  controller.enqueue(encoder.encode(
                    `data: ${JSON.stringify({ error: 'No credits remaining. Please upgrade your plan.', code: 'NO_CREDITS' })}\n\n`
                  ))
                } else {
                  Sentry.captureException(new Error(reserveError.message), { tags: { source: 'reserve_credit' } })
                  controller.enqueue(encoder.encode(
                    `data: ${JSON.stringify({ error: 'Unable to verify account status. Please try again.' })}\n\n`
                  ))
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
                const { error: refundErr } = await supabaseAdmin.rpc('refund_analysis_credit', { p_user_id: user.id })
                if (refundErr) {
                  logger.error('[analyze] Credit refund failed', { error: refundErr.message, userId: user.id })
                  Sentry.captureException(new Error(refundErr.message), { tags: { source: 'refund_credit' } })
                }
                controller.enqueue(encoder.encode(
                  `data: ${JSON.stringify({ error: 'Failed to save analysis.' })}\n\n`
                ))
              } else {
                controller.enqueue(encoder.encode(
                  `data: ${JSON.stringify({ done: true, report: cached })}\n\n`
                ))
              }
            } catch (err) {
              await supabaseAdmin.rpc('refund_analysis_credit', { p_user_id: user.id })
              controller.enqueue(encoder.encode(
                `data: ${JSON.stringify({ error: 'Failed to save analysis.' })}\n\n`
              ))
            } finally {
              timer.stop({ cached: true })
              try { controller.close() } catch { /* already closed */ }
              await redis().del(lockKey).catch(() => {})
            }
          },
        })

        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
            'X-Cache': 'HIT',
          },
        })
      }

      if (!process.env.ANTHROPIC_API_KEY) throw new Error('Server configuration error')

      // ── Fresh analysis path ────────────────────────────────────────
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        async start(controller) {
          try {
            // FIX #2: Atomic RPC credit reservation
            const { error: reserveError } = await supabaseAdmin.rpc(
              'reserve_analysis_credit',
              { p_user_id: user.id }
            )

            if (reserveError) {
              if (reserveError.message?.includes('NO_CREDITS_REMAINING')) {
                controller.enqueue(encoder.encode(
                  `data: ${JSON.stringify({ error: 'No credits remaining. Please upgrade your plan.', code: 'NO_CREDITS' })}\n\n`
                ))
              } else {
                Sentry.captureException(new Error(reserveError.message), { tags: { source: 'reserve_credit' } })
                controller.enqueue(encoder.encode(
                  `data: ${JSON.stringify({ error: 'Unable to verify account status. Please try again.' })}\n\n`
                ))
              }
              return
            }

            const prompt = buildAnalysisPrompt(trimmedQuery)
            // FIX #5: Pass AbortSignal for client disconnect detection
            const fullText = await streamWithFallback(prompt, controller, encoder, signal)

            // FIX #12: Robust JSON parsing with clear error handling
            let parsedReport: AnalysisReport
            try {
              let cleanedText = fullText.trim()

              // Strip markdown code fences if present
              if (cleanedText.includes('```json')) {
                const start = cleanedText.indexOf('```json') + 7
                const end = cleanedText.lastIndexOf('```')
                if (end > start) cleanedText = cleanedText.substring(start, end)
              } else if (cleanedText.includes('```')) {
                const start = cleanedText.indexOf('```') + 3
                const end = cleanedText.lastIndexOf('```')
                if (end > start) cleanedText = cleanedText.substring(start, end)
              }

              // Extract outermost JSON object
              const jsonStart = cleanedText.indexOf('{')
              const jsonEnd = cleanedText.lastIndexOf('}')
              if (jsonStart !== -1 && jsonEnd > jsonStart) {
                cleanedText = cleanedText.substring(jsonStart, jsonEnd + 1)
              }

              const json = JSON.parse(cleanedText.trim())

              if (!json.executiveSummary) {
                throw new Error('Missing required field: executiveSummary')
              }

              parsedReport = {
                executiveSummary: json.executiveSummary || '',
                weaknessMatrix: (json.weaknessMatrix || []).map((w: Record<string, unknown>) => ({
                  ...w,
                  quotes: (w.quotes as string[]) || [],
                  competitorsAffected: (w.competitorsAffected as unknown[]) || [],
                })),
                comparisonTable: json.comparisonTable || [],
                strategicRecommendations: json.strategicRecommendations || {
                  strongestOpportunity: '',
                  quickWinAlternative: '',
                  redFlags: '',
                },
                validationNextSteps: json.validationNextSteps || [],
                sources: (json.sources || []).filter(
                  (s: unknown) => s && typeof s === 'object' && (s as Record<string, unknown>).uri
                ),
              } as AnalysisReport
            } catch (parseErr) {
              logger.error('[analyze] JSON parse failed', {
                error: (parseErr as Error).message,
                start: fullText.slice(0, 300),
                end: fullText.slice(-300),
                length: fullText.length,
              })
              Sentry.captureException(parseErr, {
                extra: { rawLength: fullText.length, preview: fullText.slice(0, 500), userId: user.id },
              })

              // Refund credit since we can't deliver results
              await supabaseAdmin.rpc('refund_analysis_credit', { p_user_id: user.id })

              controller.enqueue(encoder.encode(
                `data: ${JSON.stringify({
                  error: 'The AI response could not be processed. Your credit has been refunded. Please try a more specific query.',
                  code: 'PARSE_ERROR',
                })}\n\n`
              ))
              try { controller.close() } catch { /* already closed */ }
              return
            }

            // Save analysis to history
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
                const { error: refundErr } = await supabaseAdmin.rpc('refund_analysis_credit', { p_user_id: user.id })
                if (refundErr) {
                  logger.error('[analyze] Credit refund failed', { error: refundErr.message, userId: user.id })
                  Sentry.captureException(new Error(refundErr.message), { tags: { source: 'refund_credit' } })
                }
                logger.error('[analyze] Failed to save', { error: saveError })
                controller.enqueue(encoder.encode(
                  `data: ${JSON.stringify({ error: 'Failed to save analysis results.' })}\n\n`
                ))
              } else {
                await setCachedAnalysis(trimmedQuery, user.id, parsedReport)
                controller.enqueue(encoder.encode(
                  `data: ${JSON.stringify({ done: true, report: parsedReport })}\n\n`
                ))
              }
            } catch (saveErr) {
              await supabaseAdmin.rpc('refund_analysis_credit', { p_user_id: user.id })
              logger.error('[analyze] Failed to save', { error: saveErr })
              controller.enqueue(encoder.encode(
                `data: ${JSON.stringify({ error: 'Failed to save analysis results.' })}\n\n`
              ))
            }
          } catch (err: unknown) {
            const error = err as { status?: number; message?: string }

            // FIX #5: Client disconnected — silent refund, no error to send
            if (error?.message === 'CLIENT_DISCONNECTED') {
              logger.info('[analyze] Client disconnected — refunding credit', { userId: user.id })
              await supabaseAdmin.rpc('refund_analysis_credit', { p_user_id: user.id })
              return
            }

            // Refund credit on any error
            const { error: refundErr } = await supabaseAdmin.rpc('refund_analysis_credit', { p_user_id: user.id })
            if (refundErr) {
              logger.error('[analyze] Credit refund failed', { error: refundErr.message, userId: user.id })
              Sentry.captureException(new Error(refundErr.message), { tags: { source: 'refund_credit' } })
            }

            if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota')) {
              Sentry.captureMessage('Claude API rate limit hit', { level: 'warning', tags: { source: 'claude_stream' } })
              controller.enqueue(encoder.encode(
                `data: ${JSON.stringify({ error: 'High demand — please try again in 60 seconds.', retryAfter: 60 })}\n\n`
              ))
            } else if (error?.status === 529 || error?.message?.includes('Overloaded')) {
              Sentry.captureMessage('Claude API overloaded', { level: 'warning', tags: { source: 'claude_stream' } })
              controller.enqueue(encoder.encode(
                `data: ${JSON.stringify({ error: 'Service is busy. Please try again in a moment.' })}\n\n`
              ))
            } else if (error?.status === 401 || error?.status === 403) {
              Sentry.captureException(new Error('Claude API authentication failed'), { tags: { source: 'claude_stream' } })
              controller.enqueue(encoder.encode(
                `data: ${JSON.stringify({ error: 'Analysis service configuration error.' })}\n\n`
              ))
            } else {
              const errObj = err instanceof Error ? err : new Error(String(err))
              Sentry.captureException(errObj, {
                tags: { source: 'claude_stream', userId: user.id },
                extra: { query: trimmedQuery, errorMessage: errObj.message },
              })
              logger.error('[analyze] Stream error', { error: errObj.message, userId: user.id })
              controller.enqueue(encoder.encode(
                `data: ${JSON.stringify({ error: 'Analysis failed. Please try again.' })}\n\n`
              ))
            }
          } finally {
            timer.stop({ cached: false, queryLength: trimmedQuery.length })
            try { controller.close() } catch { /* already closed */ }
            await redis().del(lockKey).catch(() => {})
          }
        },
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
