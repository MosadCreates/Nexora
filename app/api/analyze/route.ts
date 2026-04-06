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

// ── Fix #1 + #6: Module-level singleton — instantiated once, not per request ──
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

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

async function streamWithFallback(
  prompt: string,
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder
): Promise<string> {
  const models = [
    'claude-haiku-4-5-20251014',  // Primary — cheapest
    'claude-sonnet-4-5',           // Fallback — better quality
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
      logger.warn('[analyze] Model failed, trying next', { 
        model, 
        status: error?.status 
      })
      
      // Only retry on overload/rate limit — not on auth errors
      if (error?.status === 401 || error?.status === 400 || error?.status === 403) {
        throw err // Don't retry on these errors
      }
      
      continue
    }
  }

  throw lastError
}

export async function POST(req: NextRequest) {
  const timer = new PerformanceTimer('api/analyze')
  try {
    // ── Fix #1: Authentication ─────────────────────────────────────
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

    // ── Fix #3: Rate Limiting ──────────────────────────────────────
    const rateLimitResponse = await applyRateLimit(analyzeLimiter, user.id, req)
    if (rateLimitResponse) return rateLimitResponse

    // ── Parse & validate request body ──────────────────────────────
    const { query } = await req.json()

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    const trimmedQuery = query.trim()

    // ── Fix #5 (Audit 2): Maximum query length ────────────────────
    const MAX_QUERY_LENGTH = 500
    if (trimmedQuery.length > MAX_QUERY_LENGTH) {
      return NextResponse.json(
        { error: `Query must be ${MAX_QUERY_LENGTH} characters or less` },
        { status: 400 }
      )
    }

    // ── Fix #5 (Audit 2): Character validation ────────────────────
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

    // ── Fix #1: Service role client for DB operations ──────────────
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // ── Fix #6: In-flight request lock ─────────────────────────────
    let lockAcquired = false
    const lockKey = `analyze:lock:${user.id}`
    try {
      const r = redis()
      const result = await r.set(lockKey, '1', { nx: true, ex: 60 })
      lockAcquired = result === 'OK'
    } catch (lockErr) {
      // If Redis is down, allow the request through (lock is secondary protection)
      logger.warn('[analyze] Lock acquisition failed — proceeding without lock', {
        error: (lockErr as Error).message,
      })
      lockAcquired = true // treat as acquired to proceed
    }

    if (!lockAcquired) {
      return NextResponse.json(
        { error: 'An analysis is already in progress. Please wait.' },
        { status: 429 }
      )
    }

    try {
      const cached = await getCachedAnalysis(trimmedQuery, user.id)
      if (cached) {
        logger.info('[analyze] Cache HIT', { userId: user.id })
        
        const encoder = new TextEncoder()
        const stream = new ReadableStream({
          async start(controller) {
            try {
              // Reserve credit BEFORE returning cached
              const { error: reserveError } = await supabaseAdmin.rpc('reserve_analysis_credit', {
                p_user_id: user.id,
              })
              
              if (reserveError) {
                if (reserveError.message?.includes('NO_CREDITS_REMAINING')) {
                  controller.enqueue(encoder.encode("data: " + JSON.stringify({ error: 'No credits remaining. Please upgrade your plan.' }) + "\n\n"))
                } else {
                  controller.enqueue(encoder.encode("data: " + JSON.stringify({ error: 'Unable to verify account status.' }) + "\n\n"))
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
                await supabaseAdmin.rpc('refund_analysis_credit', { p_user_id: user.id })
                controller.enqueue(encoder.encode("data: " + JSON.stringify({ error: 'Failed to save analysis.' }) + "\n\n"))
              } else {
                controller.enqueue(encoder.encode("data: " + JSON.stringify({ done: true, report: cached }) + "\n\n"))
              }
            } catch (err) {
              await supabaseAdmin.rpc('refund_analysis_credit', { p_user_id: user.id })
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

      const apiKey = process.env.ANTHROPIC_API_KEY
      if (!apiKey) throw new Error('Server configuration error')

      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        async start(controller) {
          try {
            // STEP 1: Reserve credit BEFORE API call
            const { error: reserveError } = await supabaseAdmin.rpc('reserve_analysis_credit', {
              p_user_id: user.id,
            })

            if (reserveError) {
              if (reserveError.message?.includes('NO_CREDITS_REMAINING')) {
                controller.enqueue(encoder.encode("data: " + JSON.stringify({ error: 'No credits remaining. Please upgrade your plan.' }) + "\n\n"))
              } else {
                controller.enqueue(encoder.encode("data: " + JSON.stringify({ error: 'Unable to verify account status.' }) + "\n\n"))
              }
              return
            }

            const prompt = buildAnalysisPrompt(trimmedQuery)
            
            const fullText = await streamWithFallback(prompt, controller, encoder)
            
            // Parse the complete response
            let parsedReport: AnalysisReport
            try {
              // Clean any potential markdown wrapping
              let cleanedText = fullText
              if (cleanedText.startsWith('```json')) cleanedText = cleanedText.substring(7)
              else if (cleanedText.startsWith('```')) cleanedText = cleanedText.substring(3)
              if (cleanedText.endsWith('```')) cleanedText = cleanedText.substring(0, cleanedText.length - 3)
              
              cleanedText = cleanedText.trim()
              
              const json = JSON.parse(cleanedText)
              // Ensure we adhere to the specific response structure
              parsedReport = {
                executiveSummary: json.executiveSummary || '',
                weaknessMatrix: (json.weaknessMatrix || []).map((w: Record<string, unknown>) => ({
                  ...w, quotes: (w.quotes as string[]) || [], competitorsAffected: (w.competitorsAffected as unknown[]) || []
                })),
                comparisonTable: json.comparisonTable || [],
                strategicRecommendations: json.strategicRecommendations || { strongestOpportunity: '', quickWinAlternative: '', redFlags: '' },
                validationNextSteps: json.validationNextSteps || [],
                sources: json.sources || []
              } as AnalysisReport
            } catch (parseErr) {
              Sentry.captureException(parseErr)
              // If JSON parsing fails, create a structured response from the raw text
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
                 await supabaseAdmin.rpc('refund_analysis_credit', { p_user_id: user.id })
                 logger.error('[analyze] Failed to save', { error: saveError })
                 controller.enqueue(encoder.encode("data: " + JSON.stringify({ error: 'Failed to save analysis results.' }) + "\n\n"))
               } else {
                 await setCachedAnalysis(trimmedQuery, user.id, parsedReport)
                 controller.enqueue(encoder.encode("data: " + JSON.stringify({ done: true, report: parsedReport }) + "\n\n"))
               }
            } catch (saveErr) {
               await supabaseAdmin.rpc('refund_analysis_credit', { p_user_id: user.id })
               logger.error('[analyze] Failed to save', { error: saveErr })
               controller.enqueue(encoder.encode("data: " + JSON.stringify({ error: 'Failed to save analysis results.' }) + "\n\n"))
            }
          } catch (err: unknown) {
            try {
              await supabaseAdmin.rpc('refund_analysis_credit', {
                p_user_id: user.id,
              })
            } catch (e) {}

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
                tags: { 
                  source: 'claude_stream',
                  userId: user.id,
                },
                extra: {
                  query: trimmedQuery,
                  errorMessage: errObj.message,
                }
              })
              
              logger.error('[analyze] Stream error', { 
                error: errObj.message,
                userId: user.id 
              })
              
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
